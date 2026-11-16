import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchSession,
  initBaseUrl,
  login as apiLogin,
  logout as apiLogout,
  SessionUser,
} from "../api/client";
import { Lang } from "../i18n";

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  location: string;
  role?: string;
  level?: string;
  score?: number;
}

interface AuthContextValue {
  loggedIn: boolean;
  checking: boolean;
  user: AuthUser;
  lang: Lang;
  setLang: (lang: Lang) => Promise<void>;
  login: (identifier: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const EMPTY_USER: AuthUser = {
  name: "Membre Tchoua",
  email: "",
  location: "Cameroun",
  score: 0,
};

const AuthContext = createContext<AuthContextValue>({
  loggedIn: false,
  checking: true,
  user: EMPTY_USER,
  lang: "fr",
  setLang: async () => {},
  login: async () => ({ ok: false }),
  logout: async () => {},
});

function mapSessionUser(s: SessionUser): AuthUser {
  return {
    id: s.id,
    name: s.name ?? s.email?.split("@")[0] ?? "Membre Tchoua",
    email: s.email ?? "",
    location: s.role ? `Rôle : ${s.role}` : "Tchoua",
    role: s.role,
    level: s.level,
    score: s.score ?? 0,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<AuthUser>(EMPTY_USER);
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    (async () => {
      await initBaseUrl();
      const [savedLang, savedUserJson] = await Promise.all([
        AsyncStorage.getItem("app_lang").catch(() => null),
        AsyncStorage.getItem("auth_user").catch(() => null),
      ]);
      if (savedLang) setLangState(savedLang as Lang);

      const liveUser = await fetchSession();
      if (liveUser) {
        const mapped = mapSessionUser(liveUser);
        setUser(mapped);
        await AsyncStorage.setItem("auth_user", JSON.stringify(mapped)).catch(() => {});
        setLoggedIn(true);
      } else if (savedUserJson) {
        // Offline cached session if server unreachable
        const token = await AsyncStorage.getItem("auth_token").catch(() => null);
        if (token) {
          try {
            setUser(JSON.parse(savedUserJson));
            setLoggedIn(true);
          } catch {
            // ignore
          }
        }
      }
      setChecking(false);
    })();
  }, []);

  const setLang = async (next: Lang) => {
    setLangState(next);
    await AsyncStorage.setItem("app_lang", next).catch(() => {});
  };

  const login = async (identifier: string, password: string) => {
    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !password.trim()) {
      return { ok: false, error: "Veuillez renseigner votre email/téléphone et mot de passe." };
    }
    try {
      const res = await apiLogin(cleanIdentifier, password);
      if (!res.ok || !res.user) {
        return {
          ok: false,
          error: res.error ?? "Identifiants refusés par www.tchoua.com.",
        };
      }
      const mapped = mapSessionUser(res.user);
      setUser(mapped);
      await AsyncStorage.setItem("auth_user", JSON.stringify(mapped)).catch(() => {});
      setLoggedIn(true);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: `Connexion impossible à www.tchoua.com : ${(err as Error).message}`,
      };
    }
  };

  const logout = async () => {
    await apiLogout().catch(() => {});
    setUser(EMPTY_USER);
    setLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ loggedIn, checking, user, lang, setLang, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
