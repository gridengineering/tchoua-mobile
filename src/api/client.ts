import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  cacheClear,
  cacheGet,
  cacheSet,
  enqueueMutation,
  getPendingQueue,
  setCacheScope,
  setPendingQueue,
} from "./cache";

export const DEFAULT_BASE_URL = "https://www.tchoua.com/api";
let BASE_URL = DEFAULT_BASE_URL;

export async function initBaseUrl(): Promise<string> {
  const saved = await AsyncStorage.getItem("api_base_url").catch(() => null);
  if (saved) BASE_URL = saved;
  return BASE_URL;
}

export function setBaseUrl(url: string) {
  BASE_URL = url.replace(/\/+$/, "");
  AsyncStorage.setItem("api_base_url", BASE_URL).catch(() => { });
}

export function getBaseUrl(): string {
  return BASE_URL;
}

async function cacheScope(): Promise<{ scope: string; userId: string; server: string }> {
  const raw = await AsyncStorage.getItem("auth_user").catch(() => null);
  let userId = "anonymous";
  if (raw) {
    try {
      const user = JSON.parse(raw);
      userId = user?.id || user?.email || "anonymous";
    } catch {
      // ignore malformed cached user
    }
  }
  const server = BASE_URL;
  return { scope: `${server}|${userId}`, userId, server };
}

async function scopeKey(): Promise<string> {
  const { scope } = await cacheScope();
  setCacheScope(scope);
  return scope;
}

function newIdempotencyKey(): string {
  return `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

async function authHeader(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem("auth_token").catch(() => null);
  return token && token !== "nextauth-cookie" ? { Authorization: `Bearer ${token}` } : {};
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Versioned ARP commands are never replayed offline without explicit review. */
export async function apiOnline<T>(
  path: string,
  body?: unknown,
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  extraHeaders?: Record<string, string>
): Promise<T> {
  const auth = await authHeader();
  const resolvedMethod = method ?? (body === undefined ? "GET" : "POST");
  const response = await fetch(`${BASE_URL}${path}`, {
    method: resolvedMethod,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...auth, ...(extraHeaders ?? {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data: any = {};
  if (typeof response.text === "function") {
    const text = await response.text();
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text };
    }
  } else {
    data = await response.json();
  }
  if (!response.ok) {
    throw new ApiError(
      response.status,
      (data.error || `Erreur ${response.status}`) +
      (Array.isArray(data.missing) ? ` : ${data.missing.join(", ")}` : "")
    );
  }
  return data as T;
}

export interface ApiOptions {
  cacheKey?: string;
  cacheTtlMs?: number;
  offlineFallback?: boolean;
}

export async function apiGet<T>(
  path: string,
  opts: ApiOptions = {}
): Promise<T & { __cached?: boolean; __stale?: boolean }> {
  const cacheKey = opts.cacheKey ?? path;
  try {
    await scopeKey();
    const auth = await authHeader();
    const res = await fetch(`${BASE_URL}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...auth },
    });
    if (!res.ok) throw new ApiError(res.status, `API error ${res.status}`);
    const data = (await res.json()) as T;
    cacheSet(cacheKey, data, opts.cacheTtlMs).catch(() => { });
    return data as T & { __cached?: boolean };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (opts.offlineFallback !== false) {
      const cached = await cacheGet<T>(cacheKey);
      if (cached) {
        return { ...(cached.data as object), __cached: true, __stale: cached.stale } as T & {
          __cached?: boolean;
          __stale?: boolean;
        };
      }
    }
    throw new NetworkError((err as Error).message);
  }
}

export async function apiMutate<T>(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown
): Promise<T> {
  const { scope, userId, server } = await cacheScope();
  setCacheScope(scope);
  const idempotencyKey = newIdempotencyKey();
  try {
    const auth = await authHeader();
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
        ...auth,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      let message = text || `API error ${res.status}`;
      try {
        const parsed = JSON.parse(text);
        if (parsed?.error) message = parsed.error;
      } catch {
        // Keep raw text
      }
      throw new ApiError(res.status, message);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    await enqueueMutation({ method, path, body, scope, userId, server, idempotencyKey });
    throw new NetworkError((err as Error).message);
  }
}

export const apiPost = <T>(path: string, body: object) => apiMutate<T>("POST", path, body);
export const apiPatch = <T>(path: string, body: object) => apiMutate<T>("PATCH", path, body);
export const apiDelete = <T>(path: string) => apiMutate<T>("DELETE", path);

export async function syncPending(): Promise<{ ok: number; failed: number }> {
  const { scope } = await cacheScope();
  setCacheScope(scope);
  const queue = await getPendingQueue(scope);
  if (queue.length === 0) return { ok: 0, failed: 0 };

  const auth = await authHeader();
  const remaining: typeof queue = [];
  let ok = 0;

  for (const m of queue) {
    try {
      const res = await fetch(`${BASE_URL}${m.path}`, {
        method: m.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(m.idempotencyKey ? { "Idempotency-Key": m.idempotencyKey } : {}),
          ...auth,
        },
        body: m.body !== undefined ? JSON.stringify(m.body) : undefined,
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      ok++;
    } catch {
      remaining.push(m);
    }
  }

  // Avoid replaying a scoped entry under another account: replace only the
  // entries belonging to this scope, keep all other account queues intact.
  const all = await getPendingQueue();
  const untouched = all.filter((entry) => (entry.scope ?? "anonymous") !== scope);
  await setPendingQueue([...untouched, ...remaining]);
  return { ok, failed: remaining.length };
}

export interface SessionUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  level?: string;
  score?: number;
  avatar?: string | null;
}

export async function fetchSession(): Promise<SessionUser | null> {
  try {
    const auth = await authHeader();
    if (auth.Authorization) {
      const mobileRes = await fetch(`${BASE_URL}/auth/mobile`, {
        credentials: "include",
        headers: { Accept: "application/json", ...auth },
      });
      if (mobileRes.ok) {
        const data = await mobileRes.json();
        if (data?.user?.email) return data.user as SessionUser;
      }
    }

    const res = await fetch(`${BASE_URL}/auth/session`, {
      credentials: "include",
      headers: { Accept: "application/json", ...auth },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.user?.email ? (data.user as SessionUser) : null;
  } catch {
    return null;
  }
}

export async function login(
  identifier: string,
  password: string,
  countryCode = ""
): Promise<{ ok: boolean; user?: SessionUser; error?: string }> {
  // 1. Try dedicated Mobile Bearer JWT endpoint (/api/auth/mobile)
  const mobileRes = await fetch(`${BASE_URL}/auth/mobile`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ identifier: identifier.trim(), countryCode, password }),
  });

  if (mobileRes.status !== 404) {
    const data = await mobileRes.json().catch(() => ({}));
    if (!mobileRes.ok || !data?.token || !data?.user) {
      return {
        ok: false,
        error: data?.error ?? "Email/téléphone ou mot de passe invalide sur www.tchoua.com.",
      };
    }
    await AsyncStorage.setItem("auth_token", data.token);
    return { ok: true, user: data.user as SessionUser };
  }

  // 2. Fallback to NextAuth cookie flow
  const csrfRes = await fetch(`${BASE_URL}/auth/csrf`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!csrfRes.ok) {
    return { ok: false, error: `Serveur indisponible (${csrfRes.status})` };
  }
  const csrfJson = await csrfRes.json();
  const csrfToken: string = csrfJson?.csrfToken ?? "";
  if (!csrfToken) {
    return { ok: false, error: "Jeton CSRF manquant depuis www.tchoua.com" };
  }

  const origin = BASE_URL.replace(/\/api$/, "");
  const formBody = new URLSearchParams({
    identifier: identifier.trim(),
    email: identifier.trim(),
    password,
    csrfToken,
    callbackUrl: `${origin}/`,
    json: "true",
  }).toString();

  await fetch(`${BASE_URL}/auth/callback/credentials`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: formBody,
  });

  const user = await fetchSession();
  if (!user) {
    return {
      ok: false,
      error: "Email/téléphone ou mot de passe invalide sur www.tchoua.com.",
    };
  }

  await AsyncStorage.setItem("auth_token", "nextauth-cookie");
  return { ok: true, user };
}

export async function logout() {
  try {
    const csrfRes = await fetch(`${BASE_URL}/auth/csrf`, { credentials: "include" });
    const csrfJson = await csrfRes.json().catch(() => ({}));
    if (csrfJson?.csrfToken) {
      await fetch(`${BASE_URL}/auth/signout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          csrfToken: csrfJson.csrfToken,
          json: "true",
        }).toString(),
      });
    }
  } catch {
    // Ignore network errors on signout
  }
  await AsyncStorage.removeItem("auth_token");
  await AsyncStorage.removeItem("auth_user");
  await AsyncStorage.removeItem("selected_association_id");
  await cacheClear();
}

export async function getSelectedAssociation(): Promise<string | null> {
  return AsyncStorage.getItem("selected_association_id");
}

export async function setSelectedAssociation(id: string | null): Promise<void> {
  if (id) await AsyncStorage.setItem("selected_association_id", id);
  else await AsyncStorage.removeItem("selected_association_id");
}

export const RTC_ENDPOINTS = {
  jitsiUrl: "https://meet.tchoua.com",
  chatWsUrl: "wss://chat.tchoua.com/connection/websocket",
  turnServers: ["turn:turn.tchoua.com:3478", "turns:turn.tchoua.com:5349"],
};

export async function getAuthHeaders(): Promise<Record<string, string>> {
  return authHeader();
}

export function resolveWebUrl(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const origin = BASE_URL.replace(/\/api$/, "");
  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
}


export async function uploadAssociationProof(
  associationId: string,
  file: { uri: string; name: string; type: string }
): Promise<{ url: string; name: string; size?: number }> {
  const auth = await authHeader();
  const form = new FormData();
  form.append("file", { uri: file.uri, name: file.name, type: file.type } as any);
  const res = await fetch(`${BASE_URL}/associations/${associationId}/member-account/proofs`, {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json", ...auth },
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.url) throw new ApiError(res.status, data?.error ?? "Envoi de la preuve impossible");
  return data;
}

export async function uploadChatFile(
  associationId: string,
  file: { uri: string; name: string; type: string }
): Promise<{ url: string; name: string; mimeType: string; size: number; isImage: boolean }> {
  const auth = await authHeader();
  const form = new FormData();
  form.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  const res = await fetch(`${BASE_URL}/associations/${associationId}/messages/upload`, {
    method: "POST",
    credentials: "include",
    headers: { ...auth },
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data?.error || `Échec de l'envoi du fichier (${res.status})`);
  }
  return data;
}

export async function getRtcChatToken(
  associationId: string
): Promise<{ token: string; channels: string[]; wsUrl: string }> {
  return apiOnline(`/rtc/chat-token`, { associationId }, "POST");
}

export async function getRtcJitsiToken(
  associationId: string,
  meetingId?: string
): Promise<{ token: string; room: string; moderator: boolean; url: string }> {
  return apiOnline(`/rtc/jitsi-token`, { associationId, ...(meetingId ? { meetingId } : {}) }, "POST");
}
