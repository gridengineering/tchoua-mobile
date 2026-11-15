import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { SHADOW, SPACING } from "../../theme";
import { apiGet, getSelectedAssociation } from "../../api/client";

export const RapportsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const associationId = await getSelectedAssociation();
        if (!associationId) throw new Error("Sélectionnez une association.");
        const data = await apiGet<any>(`/associations/${associationId}/reports/ohada`);
        setReport(data);
      } catch (err) {
        setError((err as Error).message || "Rapport indisponible.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const currency = (value: number) => `${Math.round(value || 0).toLocaleString("fr-FR")} F`;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.lightGray },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Rapports Financiers</Text>
      </View>

      {loading && (
        <View style={{ padding: SPACING.lg, alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} />
          <Text style={{ color: colors.gray, marginTop: 8 }}>Calcul du rapport…</Text>
        </View>
      )}
      {error && (
        <View style={{ margin: SPACING.lg, padding: SPACING.md, borderRadius: 12, backgroundColor: "#fef2f2" }}>
          <Text style={{ color: colors.danger, fontWeight: "700" }}>{error}</Text>
        </View>
      )}

      <View style={styles.grid}>
        <View style={[styles.card, { backgroundColor: colors.primary }]}>
          <Text style={styles.cardLightLabel}>Total actif</Text>
          <Text style={styles.cardLightVal}>{currency(report?.bilan?.totalActif ?? 0)}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardLabel, { color: colors.gray }]}>Trésorerie</Text>
          <Text style={[styles.cardVal, { color: colors.success }]}>
            {currency(report?.bilan?.actifCourant?.tresorerie ?? 0)}
          </Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardLabel, { color: colors.gray }]}>Résultat net</Text>
          <Text style={[styles.cardVal, { color: colors.secondary }]}>
            {currency(report?.compteResultat?.resultatNet ?? 0)}
          </Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardLabel, { color: colors.gray }]}>Écritures</Text>
          <Text style={[styles.cardVal, { color: colors.primary }]}>{report?.journal?.length ?? 0}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Rapports détaillés</Text>
        <TouchableOpacity
          style={[styles.linkCard, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate("historique")}
        >
          <Text style={{ fontSize: 22, marginRight: 12 }}>📜</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.linkTitle, { color: colors.text }]}>
              Historique complet (Principal & Intérêts)
            </Text>
            <Text style={[styles.linkSub, { color: colors.gray }]}>
              Filtrer par type, membre ou activité
            </Text>
          </View>
          <Text style={{ color: colors.gray, fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.linkCard, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate("interets")}
        >
          <Text style={{ fontSize: 22, marginRight: 12 }}>✨</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.linkTitle, { color: colors.text }]}>
              Répartition des Intérêts & Dividendes
            </Text>
            <Text style={[styles.linkSub, { color: colors.gray }]}>
              Quote-part calculée au prorata du capital
            </Text>
          </View>
          <Text style={{ color: colors.gray, fontSize: 18 }}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: { marginRight: SPACING.md },
  backText: { fontSize: 16, fontWeight: "700" },
  title: { fontSize: 20, fontWeight: "900" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  card: {
    width: "48%",
    borderRadius: 16,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  cardLightLabel: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: "700" },
  cardLightVal: { color: "#fff", fontSize: 18, fontWeight: "900", marginTop: 4 },
  cardLabel: { fontSize: 11, fontWeight: "700" },
  cardVal: { fontSize: 18, fontWeight: "900", marginTop: 4 },
  section: { paddingHorizontal: SPACING.lg },
  sectionTitle: { fontSize: 16, fontWeight: "900", marginBottom: SPACING.sm },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  linkTitle: { fontSize: 14, fontWeight: "800" },
  linkSub: { fontSize: 12, marginTop: 2 },
});
