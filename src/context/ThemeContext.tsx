import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiGet, apiPatch } from "../api/client";
import {
  DEFAULT_MEMBER_THEME,
  getThemeColors,
  isMemberTheme,
  MemberThemeId,
  ThemeColors,
} from "../theme";

const STORAGE_KEY = "member_theme";

interface ThemeContextValue {
  themeId: MemberThemeId;
  colors: ThemeColors;
  setTheme: (id: MemberThemeId) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeId: DEFAULT_MEMBER_THEME,
  colors: getThemeColors(DEFAULT_MEMBER_THEME),
  setTheme: async () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<MemberThemeId>(DEFAULT_MEMBER_THEME);

  useEffect(() => {
    let active = true;
    (async () => {
      const local = await AsyncStorage.getItem(STORAGE_KEY).catch(() => null);
      if (active && isMemberTheme(local)) {
        setThemeId(local);
      }
      try {
        const res = await apiGet<{ theme: string }>("/users/theme", { offlineFallback: false });
        if (active && isMemberTheme(res?.theme)) {
          setThemeId(res.theme);
          await AsyncStorage.setItem(STORAGE_KEY, res.theme);
        }
      } catch {
        // Offline or unauthenticated: keep local theme
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const setTheme = async (id: MemberThemeId) => {
    setThemeId(id);
    await AsyncStorage.setItem(STORAGE_KEY, id).catch(() => {});
    try {
      await apiPatch("/users/theme", { theme: id });
    } catch {
      // Queued for replay by apiPatch if offline
    }
  };

  return (
    <ThemeContext.Provider value={{ themeId, colors: getThemeColors(themeId), setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  return useContext(ThemeContext);
}
