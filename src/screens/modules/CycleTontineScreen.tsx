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
import {
  CYCLE_MODE_LABELS,
  CycleMode,
  CycleResponse,
  formatShareFraction,
} from "../../types/association";

function buildDemoCycle(tontineName?: string): CycleResponse {
  return {
    activity: {
      id: "act-demo",
      name: tontineName || "Tontine des Entrepreneurs",
      type: "TONTINE_ENCHERES",
      distributionMode: "AUCTION",
      partAmount: 50000,
      beneficiaryAmountPerShare: 550000,
      minShareFraction: 0.5,
      maxSharesPerMember: 2,
      maxBeneficiarySharesPerSession: 2,
      allowPartialShares: true,
      allowSameBeneficiaryMultipleShares: true,
      cycleMode: "FIXED_SESSIONS",
      cycleSessions: 12,
      cycleStart: "2026-01-15T00:00:00.000Z",
      cycleEnd: null,
    },
    summary: {
      totalContributions: 3600000,
      totalDistributed: 3300000,
      balance: 300000,
      totalParts: 12,
      distributedParts: 6,
      remainingParts: 6,
      plannedSessions: 12,
      heldSessions: 6,
      progress: 50,
    },
    members: [
      {
        membershipId: "m-1",
        name: "Marie Ngono",
        contributed: 300000,
        received: 550000,
        parts: 1,
        receivedParts: 1,
        net: -250000,
      },
      {
        membershipId: "m-2",
        name: "Jean Mbarga",
        contributed: 150000,
        received: 0,
        parts: 0.5,
        receivedParts: 0,
        net: 150000,
      },
      {
        membershipId: "m-3",
        name: "Pauline Fotso",
        contributed: 600000,
        received: 550000,
        parts: 2,
        receivedParts: 1,
        net: 50000,
      },
    ],
    sessions: [
      {
        id: "s-6",
        number: 6,
        date: "2026-06-15T00:00:00.000Z",
        status: "HELD",
        contributions: 600000,
        distributions: 550000,
        balance: 50000,
        pot: 600000,
      },
      {
        id: "s-5",
        number: 5,
        date: "2026-05-15T00:00:00.000Z",
        status: "HELD",
        contributions: 600000,
        distributions: 550000,
        balance: 50000,
        pot: 600000,
      },
    ],
    beneficiaries: [
      {
        id: "b-1",
        member: "Marie Ngono",
        membershipId: "m-1",
        session: 5,
        parts: 1,
        amount: 550000,
        date: "2026-05-15T00:00:00.000Z",
      },
    ],
  };
}

function fmt(n: number) {
  return `${Math.round(n).toLocaleString("fr-FR")} F`;
}

export const CycleTontineScreen = ({ navigation, route }: any) => {
  const { colors } = useTheme();
  const actId: string | undefined = route?.params?.activityId;
  const paramAssocId: string | undefined = route?.params?.associationId;
  const actName: string | undefined = route?.params?.name;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CycleResponse>(() => buildDemoCycle(actName));

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const assocId = paramAssocId ?? (await getSelectedAssociation());
        if (assocId && actId) {
          const res = await apiGet<CycleResponse>(
            `/associations/${assocId}/activities/${actId}/cycle`
          );
          if (active && res?.activity) {
            setData(res);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fallback to demo data
      }
      if (active) {
        setData(buildDemoCycle(actName));
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [actId, paramAssocId, actName]);

  const cycleModeLabel =
    CYCLE_MODE_LABELS[(data.activity.cycleMode as CycleMode) ?? "FIXED_SESSIONS"] ??
    data.activity.cycleMode;

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
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {data.activity.name}
          </Text>
          <Text style={[styles.subtitle, { color: colors.gray }]}>Suivi du cycle & parts</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
      ) : (
        <>
          {/* Progress Card */}
          <View style={[styles.progressCard, { backgroundColor: colors.primary }]}>
            <View style={styles.progressTop}>
              <Text style={styles.progressTitle}>Progression du cycle</Text>
              <Text style={styles.progressPct}>{data.summary.progress}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${data.summary.progress}%`, backgroundColor: colors.secondary },
                ]}
              />
            </View>
            <View style={styles.progressMetaRow}>
              <Text style={styles.progressMeta}>
                Parts : {data.summary.distributedParts} / {data.summary.totalParts} distribuées
              </Text>
              {data.summary.plannedSessions ? (
                <Text style={styles.progressMeta}>
                  Sessions : {data.summary.heldSessions}/{data.summary.plannedSessions}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Summary KPIs */}
          <View style={styles.kpiRow}>
            <View style={[styles.kpiCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.kpiLabel, { color: colors.gray }]}>Cotisé</Text>
              <Text style={[styles.kpiVal, { color: colors.success }]}>
                {fmt(data.summary.totalContributions)}
              </Text>
            </View>
            <View style={[styles.kpiCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.kpiLabel, { color: colors.gray }]}>Distribué</Text>
              <Text style={[styles.kpiVal, { color: colors.secondary }]}>
                {fmt(data.summary.totalDistributed)}
              </Text>
            </View>
            <View style={[styles.kpiCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.kpiLabel, { color: colors.gray }]}>Solde</Text>
              <Text style={[styles.kpiVal, { color: colors.primary }]}>
                {fmt(data.summary.balance)}
              </Text>
            </View>
          </View>

          {/* Flexible Tontine Rules */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Paramètres du cycle & parts
            </Text>
            <View style={[styles.rulesCard, { backgroundColor: colors.surface }]}>
              <View style={styles.ruleRow}>
                <Text style={[styles.ruleLabel, { color: colors.gray }]}>Mode de cycle</Text>
                <Text style={[styles.ruleVal, { color: colors.text }]}>{cycleModeLabel}</Text>
              </View>
              <View style={styles.ruleRow}>
                <Text style={[styles.ruleLabel, { color: colors.gray }]}>
                  Montant / part bénéficiaire
                </Text>
                <Text style={[styles.ruleVal, { color: colors.text }]}>
                  {data.activity.beneficiaryAmountPerShare
                    ? fmt(data.activity.beneficiaryAmountPerShare)
                    : "Selon le pot"}
                </Text>
              </View>
              <View style={styles.ruleRow}>
                <Text style={[styles.ruleLabel, { color: colors.gray }]}>Fraction minimale</Text>
                <Text style={[styles.ruleVal, { color: colors.text }]}>
                  {formatShareFraction(data.activity.minShareFraction)}
                </Text>
              </View>
              <View style={styles.ruleRow}>
                <Text style={[styles.ruleLabel, { color: colors.gray }]}>
                  Plafond bénéficiaire / session
                </Text>
                <Text style={[styles.ruleVal, { color: colors.text }]}>
                  {data.activity.maxBeneficiarySharesPerSession
                    ? `${data.activity.maxBeneficiarySharesPerSession} part(s)`
                    : "Selon le pot"}
                </Text>
              </View>
              <View style={styles.ruleRow}>
                <Text style={[styles.ruleLabel, { color: colors.gray }]}>
                  Fractions & multi-parts
                </Text>
                <Text style={[styles.ruleVal, { color: colors.text }]}>
                  {data.activity.allowPartialShares ? "Fractions OK" : "Entières"} ·{" "}
                  {data.activity.allowSameBeneficiaryMultipleShares
                    ? "Multi-parts OK"
                    : "1 part max"}
                </Text>
              </View>
            </View>
          </View>

          {/* Members Breakdown */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Situation des membres</Text>
            {data.members.map((m) => (
              <View key={m.membershipId} style={[styles.rowCard, { backgroundColor: colors.surface }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>{m.name}</Text>
                  <Text style={[styles.rowMeta, { color: colors.gray }]}>
                    {m.parts} part(s) · Reçues : {m.receivedParts}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.rowTitle, { color: colors.primary }]}>
                    Cotisé {fmt(m.contributed)}
                  </Text>
                  <Text
                    style={[
                      styles.rowMeta,
                      { color: m.received > 0 ? colors.success : colors.gray },
                    ]}
                  >
                    Reçu {fmt(m.received)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Recent Beneficiaries */}
          {data.beneficiaries.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Derniers bénéficiaires
              </Text>
              {data.beneficiaries.map((b) => (
                <View key={b.id} style={[styles.rowCard, { backgroundColor: colors.surface }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowTitle, { color: colors.text }]}>{b.member}</Text>
                    <Text style={[styles.rowMeta, { color: colors.gray }]}>
                      Session #{b.session} · {b.parts} part(s) ·{" "}
                      {new Date(b.date).toLocaleDateString("fr-FR")}
                    </Text>
                  </View>
                  <Text style={[styles.rowTitle, { color: colors.secondary }]}>
                    {fmt(b.amount)}
                  </Text>
                </View>
              ))}
            </View>
          )}
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
  title: { fontSize: 18, fontWeight: "900" },
  subtitle: { fontSize: 12, marginTop: 2 },
  progressCard: {
    margin: SPACING.lg,
    borderRadius: 20,
    padding: SPACING.lg,
    ...SHADOW.md,
  },
  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  progressTitle: { color: "#fff", fontSize: 14, fontWeight: "800" },
  progressPct: { color: "#fff", fontSize: 20, fontWeight: "900" },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 4 },
  progressMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.sm,
  },
  progressMeta: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: "600" },
  kpiRow: { flexDirection: "row", paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  kpiCard: { flex: 1, borderRadius: 14, padding: SPACING.md, ...SHADOW.sm },
  kpiLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  kpiVal: { fontSize: 14, fontWeight: "900", marginTop: 4 },
  section: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
  sectionTitle: { fontSize: 16, fontWeight: "900", marginBottom: SPACING.sm },
  rulesCard: { borderRadius: 16, padding: SPACING.md, ...SHADOW.sm },
  ruleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  ruleLabel: { fontSize: 12, fontWeight: "600" },
  ruleVal: { fontSize: 12, fontWeight: "800" },
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
});
