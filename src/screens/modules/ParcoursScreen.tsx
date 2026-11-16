import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { apiGet } from "../../api/client";
import { useTheme } from "../../context/ThemeContext";
import { SPACING } from "../../theme";

type Step = {
  key: string;
  title: string;
  description: string;
  status: "DONE" | "CURRENT" | "UPCOMING" | "BLOCKED";
  action: string;
  href: string;
  meta?: string;
};

export const ParcoursScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await apiGet<any>("/member/journey");
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openStep = (step: Step) => {
    if (step.key === "kyc") navigation.navigate("Profil");
    else if (step.key === "session") navigation.navigate("sessions");
    else if (step.key === "subscription" || step.key === "allocation") navigation.navigate("Accueil");
    else navigation.navigate("Profil");
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
      contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}
    >
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <Text style={styles.eyebrow}>PARCOURS MEMBRE</Text>
        <Text style={styles.title}>De l’inscription au versement</Text>
        <Text style={styles.subtitle}>
          Chaque étape est obligatoire avant la suivante. Vous reprenez là où vous vous êtes arrêté.
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${data?.progress ?? 0}%`, backgroundColor: colors.secondary }]} />
        </View>
        <Text style={styles.progressText}>{data?.progress ?? 0}% des étapes essentielles terminées</Text>
        {data?.next && (
          <TouchableOpacity style={[styles.cta, { backgroundColor: colors.secondary }]} onPress={() => openStep(data.next)}>
            <Text style={[styles.ctaText, { color: colors.primary }]}>Continuer : {data.next.action}</Text>
          </TouchableOpacity>
        )}
      </View>

      {(data?.steps ?? []).map((step: Step) => {
        const done = step.status === "DONE";
        const current = step.status === "CURRENT";
        return (
          <TouchableOpacity
            key={step.key}
            onPress={() => openStep(step)}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: current ? colors.secondary : colors.lightGray }]}
          >
            <View style={[styles.badge, { backgroundColor: done ? "#DCFCE7" : current ? "#FEF3C7" : colors.background }]}>
              <Text style={{ fontSize: 17 }}>{done ? "✓" : current ? "→" : "○"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{step.title}</Text>
              <Text style={[styles.cardDesc, { color: colors.gray }]}>{step.description}</Text>
              {step.meta ? <Text style={[styles.meta, { color: colors.primary }]}>{step.meta}</Text> : null}
              <Text style={[styles.action, { color: colors.secondary }]}>{step.action}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  hero: { borderRadius: 24, padding: 24, marginBottom: 16 },
  eyebrow: { color: "#f5c542", fontSize: 11, fontWeight: "900", letterSpacing: 2 },
  title: { color: "#fff", fontSize: 26, fontWeight: "900", marginTop: 8 },
  subtitle: { color: "rgba(255,255,255,0.72)", fontSize: 13, lineHeight: 19, marginTop: 8 },
  progressTrack: { height: 7, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 999, marginTop: 18, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999 },
  progressText: { color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 6 },
  cta: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignSelf: "flex-start" },
  ctaText: { fontSize: 13, fontWeight: "900" },
  card: { flexDirection: "row", gap: 12, borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 10 },
  badge: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 15, fontWeight: "800" },
  cardDesc: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  meta: { fontSize: 11, fontWeight: "700", marginTop: 6 },
  action: { fontSize: 12, fontWeight: "800", marginTop: 8 },
});
