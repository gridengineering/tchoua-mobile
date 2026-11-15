import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiGet, getBaseUrl, getSelectedAssociation } from "../../api/client";
import { useTheme } from "../../context/ThemeContext";
import { SHADOW, SPACING } from "../../theme";
import { showAlert } from "../../utils/feedback";

export const RapportsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assocId, setAssocId] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    totalContributed: 0,
    totalReceived: 0,
    treasury: 0,
    resultatNet: 0,
    sectionsCount: 0,
    journalEntries: 0,
  });

  const loadReports = useCallback(async () => {
    try {
      const [assoc, consolidated] = await Promise.all([
        getSelectedAssociation(),
        apiGet<any>("/reports/consolidated").catch(() => null),
      ]);

      let treasury = 0;
      let resultatNet = 0;
      let journalEntries = 0;
      let sectionsCount = 0;

      if (assoc) {
        setAssocId(assoc);
        const [ohada, fed] = await Promise.all([
          apiGet<any>(`/associations/${assoc}/reports/ohada`).catch(() => null),
          apiGet<any>(`/associations/${assoc}/reports/federation`).catch(() => null),
        ]);
        treasury = ohada?.bilan?.actifCourant?.tresorerie ?? 0;
        resultatNet = ohada?.compteResultat?.resultatNet ?? 0;
        journalEntries = Array.isArray(ohada?.journal) ? ohada.journal.length : 0;
        sectionsCount = fed?.totals?.sectionsCount ?? 0;
      }

      const totals = consolidated?.summary ?? consolidated ?? {};
      setSummary({
        totalContributed: totals.totalContributed ?? 0,
        totalReceived: totals.totalReceived ?? 0,
        treasury,
        resultatNet,
        sectionsCount,
        journalEntries,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const openExport = (path: string) => {
    if (!assocId) {
      showAlert("Association requise", "Sélectionnez une association pour exporter.");
      return;
    }
    Linking.openURL(`${getBaseUrl()}${path}`);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadReports();
          }}
        />
      }
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

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
      ) : (
        <View style={styles.grid}>
          <View style={[styles.card, { backgroundColor: colors.primary }]}>
            <Text style={styles.cardLightLabel}>Total Cotisé</Text>
            <Text style={styles.cardLightVal}>
              {summary.totalContributed.toLocaleString("fr-FR")} F
            </Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardLabel, { color: colors.gray }]}>Total Reçu</Text>
            <Text style={[styles.cardVal, { color: colors.success }]}>
              {summary.totalReceived.toLocaleString("fr-FR")} F
            </Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardLabel, { color: colors.gray }]}>Trésorerie Assoc.</Text>
            <Text style={[styles.cardVal, { color: colors.secondary }]}>
              {summary.treasury.toLocaleString("fr-FR")} F
            </Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardLabel, { color: colors.gray }]}>Résultat SYSCOHADA</Text>
            <Text style={[styles.cardVal, { color: colors.primary }]}>
              {summary.resultatNet.toLocaleString("fr-FR")} F
            </Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Rapports détaillés & Exports</Text>

        <TouchableOpacity
          style={[styles.linkCard, { backgroundColor: colors.surface }]}
          onPress={() => openExport(`/associations/${assocId}/reports/ohada?format=csv`)}
        >
          <Text style={{ fontSize: 22, marginRight: 12 }}>📒</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.linkTitle, { color: colors.text }]}>
              Export Journal SYSCOHADA (CSV)
            </Text>
            <Text style={[styles.linkSub, { color: colors.gray }]}>
              {summary.journalEntries} écriture(s) comptable(s) en partie double
            </Text>
          </View>
          <Text style={{ color: colors.gray, fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.linkCard, { backgroundColor: colors.surface }]}
          onPress={() => openExport(`/associations/${assocId}/reports/federation?format=csv`)}
        >
          <Text style={{ fontSize: 22, marginRight: 12 }}>🏛️</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.linkTitle, { color: colors.text }]}>
              Consolidation Fédérale (CSV)
            </Text>
            <Text style={[styles.linkSub, { color: colors.gray }]}>
              {summary.sectionsCount} section(s) rattachée(s)
            </Text>
          </View>
          <Text style={{ color: colors.gray, fontSize: 18 }}>›</Text>
        </TouchableOpacity>

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
