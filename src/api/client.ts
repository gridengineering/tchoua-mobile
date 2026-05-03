import AsyncStorage from "@react-native-async-storage/async-storage";

// Change this to your server URL in production
const BASE_URL = "http://localhost:3000/api";

export async function apiGet<T>(path: string): Promise<T> {
  const token = await AsyncStorage.getItem("auth_token");
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function apiPost<T>(path: string, body: object): Promise<T> {
  const token = await AsyncStorage.getItem("auth_token");
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
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
}
