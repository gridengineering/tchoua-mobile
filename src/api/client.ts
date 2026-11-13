import AsyncStorage from "@react-native-async-storage/async-storage";
import { cacheGet, cacheSet, enqueueMutation, getPendingQueue, setPendingQueue } from "./cache";

export const DEFAULT_BASE_URL = "https://www.tchoua.com/api";
let BASE_URL = DEFAULT_BASE_URL;

export async function initBaseUrl(): Promise<string> {
  const saved = await AsyncStorage.getItem("api_base_url").catch(() => null);
  if (saved) BASE_URL = saved;
  return BASE_URL;
}

export function setBaseUrl(url: string) {
  BASE_URL = url.replace(/\/+$/, "");
  AsyncStorage.setItem("api_base_url", BASE_URL).catch(() => {});
}

export function getBaseUrl(): string {
  return BASE_URL;
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
    const auth = await authHeader();
    const res = await fetch(`${BASE_URL}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...auth },
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = (await res.json()) as T;
    cacheSet(cacheKey, data, opts.cacheTtlMs).catch(() => {});
    return data as T & { __cached?: boolean };
  } catch (err) {
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
  try {
    const auth = await authHeader();
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...auth },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `API error ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    await enqueueMutation({ method, path, body });
    throw new NetworkError((err as Error).message);
  }
}

export const apiPost = <T>(path: string, body: object) => apiMutate<T>("POST", path, body);
export const apiPatch = <T>(path: string, body: object) => apiMutate<T>("PATCH", path, body);
export const apiDelete = <T>(path: string) => apiMutate<T>("DELETE", path);

export async function syncPending(): Promise<{ ok: number; failed: number }> {
  const queue = await getPendingQueue();
  if (queue.length === 0) return { ok: 0, failed: 0 };

  const auth = await authHeader();
  const remaining: typeof queue = [];
  let ok = 0;

  for (const m of queue) {
    try {
      const res = await fetch(`${BASE_URL}${m.path}`, {
        method: m.method,
        credentials: "include",
        headers: { "Content-Type": "application/json", ...auth },
        body: m.body !== undefined ? JSON.stringify(m.body) : undefined,
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      ok++;
    } catch {
      remaining.push(m);
    }
  }

  await setPendingQueue(remaining);
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
  email: string,
  password: string
): Promise<{ ok: boolean; user?: SessionUser; error?: string }> {
  // 1. Try dedicated Mobile Bearer JWT endpoint (/api/auth/mobile)
  const mobileRes = await fetch(`${BASE_URL}/auth/mobile`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
  });

  if (mobileRes.status !== 404) {
    const data = await mobileRes.json().catch(() => ({}));
    if (!mobileRes.ok || !data?.token || !data?.user) {
      return {
        ok: false,
        error: data?.error ?? "Email ou mot de passe invalide sur www.tchoua.com.",
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
    email: email.trim(),
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
      error: "Email ou mot de passe invalide sur www.tchoua.com.",
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
}

export async function getSelectedAssociation(): Promise<string | null> {
  return AsyncStorage.getItem("selected_association_id");
}

export async function setSelectedAssociation(id: string | null): Promise<void> {
  if (id) await AsyncStorage.setItem("selected_association_id", id);
  else await AsyncStorage.removeItem("selected_association_id");
}
