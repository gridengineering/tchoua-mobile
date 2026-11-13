// AsyncStorage-backed offline cache with TTL.
// Mobile users in low-connectivity areas need to read recent state without network.

import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX = "tchoua_cache:";
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  ts: number;
  ttl: number;
}

export async function cacheSet<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): Promise<void> {
  const entry: CacheEntry<T> = { data, ts: Date.now(), ttl: ttlMs };
  await AsyncStorage.setItem(PREFIX + key, JSON.stringify(entry));
}

export async function cacheGet<T>(key: string): Promise<{ data: T; stale: boolean } | null> {
  const raw = await AsyncStorage.getItem(PREFIX + key);
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
  const ours = keys.filter((k) => k.startsWith(PREFIX));
  await Promise.all(ours.map(key => AsyncStorage.removeItem(key)));
}

// Pending mutations queue — mutations made while offline are stored here
// and replayed when the network returns.
const QUEUE_KEY = PREFIX + "pending_queue";

export interface PendingMutation {
  id: string;
  method: "POST" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  ts: number;
}

export async function enqueueMutation(m: Omit<PendingMutation, "id" | "ts">): Promise<void> {
  const queue = await getPendingQueue();
  const entry: PendingMutation = { ...m, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, ts: Date.now() };
  queue.push(entry);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function getPendingQueue(): Promise<PendingMutation[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PendingMutation[];
  } catch {
    return [];
  }
}

export async function setPendingQueue(queue: PendingMutation[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function pendingCount(): Promise<number> {
  return (await getPendingQueue()).length;
}
