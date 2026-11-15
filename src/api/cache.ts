// AsyncStorage-backed offline cache with TTL.
// Mobile users in low-connectivity areas need to read recent state without network.

import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX = "tchoua_cache:";
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

// The cache and pending queue are partitioned by account + server so a device
// shared by two members can never read or replay the first member's data.
let CURRENT_SCOPE = "anonymous";
export function setCacheScope(scope: string) {
  CURRENT_SCOPE = scope || "anonymous";
}
function scopedPrefix(): string {
  return `${PREFIX}${encodeURIComponent(CURRENT_SCOPE)}:`;
}

interface CacheEntry<T> {
  data: T;
  ts: number;
  ttl: number;
}

export async function cacheSet<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): Promise<void> {
  const entry: CacheEntry<T> = { data, ts: Date.now(), ttl: ttlMs };
  await AsyncStorage.setItem(scopedPrefix() + key, JSON.stringify(entry));
}

export async function cacheGet<T>(key: string): Promise<{ data: T; stale: boolean } | null> {
  const raw = await AsyncStorage.getItem(scopedPrefix() + key);
  if (!raw) return null;
  try {
    const entry = JSON.parse(raw) as CacheEntry<T>;
    const stale = Date.now() - entry.ts > entry.ttl;
    return { data: entry.data, stale };
  } catch {
    return null;
  }
}

export async function cacheClear(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const ours = keys.filter((k) => k.startsWith(PREFIX) && !k.includes("pending_queue"));
  await Promise.all(ours.map(key => AsyncStorage.removeItem(key)));
}

// Pending mutations queue — mutations made while offline are stored here
// and replayed when the network returns. Entries are scoped to the account
// and server that created them.
const QUEUE_KEY = PREFIX + "pending_queue";

export interface PendingMutation {
  id: string;
  method: "POST" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  ts: number;
  scope?: string;
  userId?: string;
  server?: string;
  idempotencyKey?: string;
}

export async function enqueueMutation(
  m: Omit<PendingMutation, "id" | "ts" | "scope" | "userId" | "server" | "idempotencyKey"> & {
    scope: string;
    userId?: string;
    server?: string;
    idempotencyKey?: string;
  }
): Promise<void> {
  const queue = await getPendingQueue();
  const entry: PendingMutation = {
    ...m,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ts: Date.now(),
    scope: m.scope || CURRENT_SCOPE,
  };
  queue.push(entry);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function getPendingQueue(scope?: string): Promise<PendingMutation[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    const all = JSON.parse(raw) as PendingMutation[];
    return scope ? all.filter((entry) => (entry.scope ?? CURRENT_SCOPE) === scope) : all;
  } catch {
    return [];
  }
}

export async function setPendingQueue(queue: PendingMutation[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/** Remove only the entries that were successfully replayed for this scope. */
export async function removePendingEntries(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const remaining = (await getPendingQueue()).filter((entry) => !ids.includes(entry.id));
  await setPendingQueue(remaining);
}

export async function pendingCount(): Promise<number> {
  return (await getPendingQueue()).length;
}
