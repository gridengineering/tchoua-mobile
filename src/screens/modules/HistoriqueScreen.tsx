import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { apiGet, getSelectedAssociation } from "../../api/client";
import { useTheme } from "../../context/ThemeContext";
import { SHADOW, SPACING } from "../../theme";
import { HistoryEvent, HistoryResponse } from "../../types/association";

const TYPE_FILTERS = [
  { key: "ALL", label: "Tout" },
  { key: "CONTRIBUTION", label: "Cotisations" },
  { key: "REPAYMENT", label: "Principal" },
  { key: "INTEREST", label: "Intérêts" },
  { key: "LOAN", label: "Prêts" },
  { key: "BENEFICIARY", label: "Bénéfices" },
  { key: "AID", label: "Aides" },
];

const DEMO_HISTORY: HistoryResponse = {
  scope: "association",
  typeFilter: "ALL",
  page: 1,
  pageSize: 25,
  total: 5,
  pages: 1,
  summary: { in: 115000, out: 50000, net: 65000 },
  canViewAll: true,
  events: [
    {
      id: "c-1",
      date: "2026-05-12T18:30:00.000Z",
      type: "CONTRIBUTION",
      label: "Cotisation — Tontine des Entrepreneurs",
      amount: 50000,
      direction: "IN",
      memberName: "Marie Ngono",
      activityName: "Tontine des Entrepreneurs",
    },
    {
      id: "r-1",
      date: "2026-05-10T14:00:00.000Z",
      type: "REPAYMENT",
      label: "Remboursement principal — Jean Mbarga",
      amount: 50000,
      direction: "IN",
      memberName: "Jean Mbarga",
      activityName: "Caisse Prêts AMSED",
      meta: { principal: 50000, intérêt: 5000, versement: 55000 },
    },
    {
      id: "i-1",
      date: "2026-05-10T14:00:00.000Z",
      type: "INTEREST",
      label: "Part d'intérêts — prêt Jean Mbarga",
      amount: 15000,
      direction: "IN",
      memberName: "Marie Ngono",
      activityName: "Caisse Prêts AMSED",
      meta: { quotePart: 0.12 },
    },
    {
      id: "b-1",
      date: "2026-05-05T16:00:00.000Z",
      type: "BENEFICIARY",
      label: "Bénéficiaire — Tontine Scolaire A30",
      amount: 50000,
      direction: "OUT",
      memberName: "Marie Ngono",
      activityName: "Tontine Scolaire A30",
      meta: { parts: 0.5, session: 4 },
    },
  ],
};

function formatAmount(n: number) {
  return `${Math.round(n).toLocaleString("fr-FR")} F`;
}

function eventIcon(type: string) {
  switch (type) {
    case "CONTRIBUTION":
      return "💸";
    case "REPAYMENT":
      return "🏦";
    case "INTEREST":
      return "✨";
    case "LOAN":
      return "💳";
    case "BENEFICIARY":
      return "🎁";
    case "AID":
      return "🤝";
    case "CAPITAL":
      return "🪙";
    default:
      return "📄";
  }
}

export const HistoriqueScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [scope, setScope] = useState<"association" | "member">("association");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<HistoryResponse>(DEMO_HISTORY);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const assocId = await getSelectedAssociation();
        if (assocId) {
          const res = await apiGet<HistoryResponse>(
            `/associations/${assocId}/history?scope=${scope}&type=${typeFilter}`
          );
          if (active && res?.events) {
            setData(res);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fallback to demo data
      }
      if (active) {
        const filtered = DEMO_HISTORY.events.filter((e) =>
          typeFilter === "ALL" ? true : e.type === typeFilter
        );
        const summary = filtered.reduce(
          (acc, e) => {
            if (e.direction === "IN") acc.in += e.amount;
            else acc.out += e.amount;
            return acc;
          },
          { in: 0, out: 0 }
        );
        setData({
          ...DEMO_HISTORY,
          scope,
          typeFilter,
          events: filtered,
          summary: { in: summary.in, out: summary.out, net: summary.in - summary.out },
        });
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [scope, typeFilter]);

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
        <Text style={[styles.title, { color: colors.text }]}>Historique Financier</Text>
      </View>

      {/* Scope Switcher */}
      <View style={styles.scopeRow}>
        {(
          [
            { id: "association", label: "Association" },
            { id: "member", label: "Mon historique" },
          ] as const
        ).map((s) => {
          const active = scope === s.id;
          return (
            <TouchableOpacity
              key={s.id}
              onPress={() => setScope(s.id)}
              style={[
                styles.scopeBtn,
                {
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primary : colors.lightGray,
                },
              ]}
            >
              <Text style={[styles.scopeText, { color: active ? colors.white : colors.gray }]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Summary KPIs */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.summaryLabel, { color: colors.gray }]}>Entrées</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            +{formatAmount(data.summary.in)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.summaryLabel, { color: colors.gray }]}>Sorties</Text>
          <Text style={[styles.summaryValue, { color: colors.danger }]}>
            -{formatAmount(data.summary.out)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.summaryLabel, { color: colors.gray }]}>Solde net</Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            {formatAmount(data.summary.net)}
          </Text>
        </View>
      </View>

      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {TYPE_FILTERS.map((f) => {
          const active = typeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setTypeFilter(f.key)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? colors.secondary : colors.surface,
                  borderColor: active ? colors.secondary : colors.lightGray,
                },
              ]}
            >
              <Text style={[styles.filterText, { color: active ? colors.white : colors.gray }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Notice about Principal vs Interest */}
      <View style={[styles.infoBanner, { backgroundColor: colors.primary + "12" }]}>
        <Text style={[styles.infoBannerText, { color: colors.primary }]}>
          ℹ️ Les remboursements de prêts séparent désormais le principal et la part d&apos;intérêts répartie.
        </Text>
      </View>

      {/* Events */}
      <View style={styles.section}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : data.events.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.gray }]}>
            Aucun mouvement pour ce filtre.
          </Text>
        ) : (
          data.events.map((ev: HistoryEvent) => (
            <View key={ev.id} style={[styles.eventCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.eventIcon, { backgroundColor: colors.background }]}>
                <Text style={{ fontSize: 18 }}>{eventIcon(ev.type)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.eventTitle, { color: colors.text }]}>{ev.label}</Text>
                <Text style={[styles.eventMeta, { color: colors.gray }]}>
                  {new Date(ev.date).toLocaleDateString("fr-FR")}
                  {ev.memberName ? ` · ${ev.memberName}` : ""}
                </Text>
              </View>
              <Text
                style={[
                  styles.eventAmount,
                  { color: ev.direction === "IN" ? colors.success : colors.danger },
                ]}
              >
                {ev.direction === "IN" ? "+" : "-"}
                {formatAmount(ev.amount)}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={{ height: 80 }} />
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
  scopeRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  scopeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  scopeText: { fontSize: 13, fontWeight: "800" },
  summaryRow: {
    flexDirection: "row",
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  summaryLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  summaryValue: { fontSize: 14, fontWeight: "900", marginTop: 4 },
  filterRow: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: { fontSize: 12, fontWeight: "700" },
  infoBanner: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
  },
  infoBannerText: { fontSize: 12, fontWeight: "600", lineHeight: 17 },
  section: { paddingHorizontal: SPACING.lg },
  emptyText: { textAlign: "center", marginTop: 24, fontSize: 14 },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: 14,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  eventTitle: { fontSize: 14, fontWeight: "800" },
  eventMeta: { fontSize: 11, marginTop: 2 },
  eventAmount: { fontSize: 14, fontWeight: "900", marginLeft: SPACING.sm },
});
