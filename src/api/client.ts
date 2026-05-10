import AsyncStorage from "@react-native-async-storage/async-storage";
import { cacheGet, cacheSet, enqueueMutation, getPendingQueue, setPendingQueue } from "./cache";

let BASE_URL = "http://localhost:3000/api";

export function setBaseUrl(url: string) {
  BASE_URL = url;
}

export function getBaseUrl(): string {
  return BASE_URL;
}

async function authHeader(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
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
  // If true and offline, returns cached data with stale=true. Otherwise throws.
  offlineFallback?: boolean;
}

export async function apiGet<T>(path: string, opts: ApiOptions = {}): Promise<T & { __cached?: boolean; __stale?: boolean }> {
  const cacheKey = opts.cacheKey ?? path;
  try {
    const auth = await authHeader();
    const res = await fetch(`${BASE_URL}${path}`, {
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

export async function apiMutate<T>(method: "POST" | "PATCH" | "DELETE", path: string, body?: unknown): Promise<T> {
  try {
    const auth = await authHeader();
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json", ...auth },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `API error ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    // Offline mutation: queue for later replay.
    await enqueueMutation({ method, path, body });
    throw new NetworkError((err as Error).message);
  }
}

export const apiPost = <T>(path: string, body: object) => apiMutate<T>("POST", path, body);
export const apiPatch = <T>(path: string, body: object) => apiMutate<T>("PATCH", path, body);
export const apiDelete = <T>(path: string) => apiMutate<T>("DELETE", path);

// Replay queued mutations when network comes back.
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

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, redirect: false }),
  });
  const data = await res.json();
  if (data.token) {
    await AsyncStorage.setItem("auth_token", data.token);
  }
  return data;
}

export async function logout() {
  await AsyncStorage.removeItem("auth_token");
  await AsyncStorage.removeItem("selected_association_id");
}

// Selected-association persistence — for the persistent association switcher.
export async function getSelectedAssociation(): Promise<string | null> {
  return AsyncStorage.getItem("selected_association_id");
}

export async function setSelectedAssociation(id: string | null): Promise<void> {
  if (id) await AsyncStorage.setItem("selected_association_id", id);
  else await AsyncStorage.removeItem("selected_association_id");
}
