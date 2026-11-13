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
import { InterestsResponse } from "../../types/association";

const DEMO_INTERESTS: InterestsResponse = {
  membershipId: "m-demo",
  memberName: "Marie Ngono",
  canViewAll: true,
  totals: {
    interest: 125000,
    share: 18750,
    dividendInterest: 320000,
    dividendShare: 48000,
    dividendYear: 2025,
  },
  groups: [
    { key: "2026-05", label: "mai 2026", interest: 45000, share: 6750, count: 3 },
    { key: "2026-04", label: "avril 2026", interest: 80000, share: 12000, count: 4 },
  ],
  rows: [
    {
      id: "ir-1",
      date: "2026-05-10T14:00:00.000Z",
      loanId: "l-1",
      borrower: "Jean Mbarga",
      activity: "Caisse Prêts AMSED",
      repayment: 55000,
      interestTotal: 15000,
      capital: 150000,
      totalCapital: 1000000,
      ratio: 0.15,
      memberShare: 2250,
    },
    {
      id: "ir-2",
      date: "2026-05-03T11:00:00.000Z",
      loanId: "l-2",
      borrower: "Pauline Fotso",
      activity: "Caisse Prêts AMSED",
      repayment: 130000,
      interestTotal: 30000,
      capital: 150000,
      totalCapital: 1000000,
      ratio: 0.15,
      memberShare: 4500,
    },
  ],
};

function fmt(n: number) {
  return `${Math.round(n).toLocaleString("fr-FR")} F`;
}

export const InteretsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [groupBy, setGroupBy] = useState<"month" | "member">("month");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InterestsResponse>(DEMO_INTERESTS);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const assocId = await getSelectedAssociation();
        if (assocId) {
          const res = await apiGet<InterestsResponse>(
            `/associations/${assocId}/interests?groupBy=${groupBy}`
          );
          if (active && res?.totals) {
            setData(res);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fallback to demo data
      }
      if (active) {
        setData(DEMO_INTERESTS);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [groupBy]);

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
        <Text style={[styles.title, { color: colors.text }]}>Intérêts & Dividendes</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
          <Text style={[styles.cardLabel, { color: "rgba(255,255,255,0.75)" }]}>Ma quote-part</Text>
          <Text style={[styles.cardValue, { color: colors.white }]}>
            {fmt(data.totals.share)}
          </Text>
          <Text style={[styles.cardSub, { color: "rgba(255,255,255,0.7)" }]}>
            Sur {fmt(data.totals.interest)} d&apos;intérêts
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardLabel, { color: colors.gray }]}>
            Dividende {data.totals.dividendYear ?? "annuel"}
          </Text>
          <Text style={[styles.cardValue, { color: colors.secondary }]}>
            {fmt(data.totals.dividendShare)}
          </Text>
          <Text style={[styles.cardSub, { color: colors.gray }]}>
            Pool: {fmt(data.totals.dividendInterest)}
          </Text>
        </View>
      </View>

      {/* Grouping */}
      <View style={styles.groupSwitch}>
        {(
          [
            { id: "month", label: "Par mois" },
            { id: "member", label: "Par emprunteur" },
          ] as const
        ).map((g) => {
          const active = groupBy === g.id;
          return (
            <TouchableOpacity
              key={g.id}
              onPress={() => setGroupBy(g.id)}
              style={[
                styles.groupBtn,
                {
                  backgroundColor: active ? colors.secondary : colors.surface,
                  borderColor: active ? colors.secondary : colors.lightGray,
                },
              ]}
            >
              <Text style={[styles.groupText, { color: active ? colors.white : colors.gray }]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      ) : (
        <>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Répartition</Text>
            {data.groups.map((g) => (
              <View key={g.key} style={[styles.rowCard, { backgroundColor: colors.surface }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>{g.label}</Text>
                  <Text style={[styles.rowMeta, { color: colors.gray }]}>
                    {g.count} remboursement(s) · Total {fmt(g.interest)}
                  </Text>
                </View>
                <Text style={[styles.rowAmount, { color: colors.success }]}>+{fmt(g.share)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Détail des prêts</Text>
            {data.rows.map((r) => (
              <View key={r.id} style={[styles.rowCard, { backgroundColor: colors.surface }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>{r.borrower}</Text>
                  <Text style={[styles.rowMeta, { color: colors.gray }]}>
                    {r.activity} · {new Date(r.date).toLocaleDateString("fr-FR")} · Part{" "}
                    {Math.round(r.ratio * 100)}%
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.rowAmount, { color: colors.success }]}>
                    +{fmt(r.memberShare)}
                  </Text>
                  <Text style={[styles.rowMeta, { color: colors.gray }]}>
                    sur {fmt(r.interestTotal)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

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
  summaryRow: { flexDirection: "row", padding: SPACING.lg, gap: SPACING.md },
  summaryCard: { flex: 1, borderRadius: 18, padding: SPACING.md, ...SHADOW.sm },
  cardLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  cardValue: { fontSize: 20, fontWeight: "900", marginTop: 6 },
  cardSub: { fontSize: 11, marginTop: 4 },
  groupSwitch: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  groupBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  groupText: { fontSize: 12, fontWeight: "800" },
  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: 16, fontWeight: "900", marginBottom: SPACING.sm },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: 14,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  rowTitle: { fontSize: 14, fontWeight: "800" },
  rowMeta: { fontSize: 11, marginTop: 2 },
  rowAmount: { fontSize: 14, fontWeight: "900" },
});
