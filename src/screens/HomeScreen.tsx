import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import { apiGet, setSelectedAssociation } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { COLORS, SPACING, SHADOW } from "../theme";
import {
  ASSOC_TYPE_META,
  AssociationSummary,
  AssocType,
  getMemberCount,
  HistoryEvent,
  HistoryResponse,
} from "../types/association";

const { width } = Dimensions.get("window");

interface LiveAssociation extends AssociationSummary {
  nextMeeting?: { id: string; title: string; scheduledAt: string; type?: string } | null;
}

export const HomeScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [selectedAssoc, setSelectedAssoc] = useState<string>("all");
  const [associations, setAssociations] = useState<LiveAssociation[]>([]);
  const [tontineCount, setTontineCount] = useState<number>(0);
  const [loansCount, setLoansCount] = useState<number>(0);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [recentEvents, setRecentEvents] = useState<HistoryEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [assocRes, tontinesRes, loansRes, walletRes] = await Promise.allSettled([
        apiGet<{ associations: LiveAssociation[] }>("/associations"),
        apiGet<{ items: any[] }>("/me/aggregate?resource=activities&type=TONTINE"),
        apiGet<{ items: any[] }>("/me/aggregate?resource=loans"),
        apiGet<{ balance?: number; wallet?: { balance?: number } }>("/wallet"),
      ]);

      let loadedAssocs: LiveAssociation[] = [];
      if (assocRes.status === "fulfilled" && Array.isArray(assocRes.value?.associations)) {
        loadedAssocs = assocRes.value.associations;
        setAssociations(loadedAssocs);
      }
      if (tontinesRes.status === "fulfilled" && Array.isArray(tontinesRes.value?.items)) {
        setTontineCount(tontinesRes.value.items.length);
      }
      if (loansRes.status === "fulfilled" && Array.isArray(loansRes.value?.items)) {
        setLoansCount(loansRes.value.items.length);
      }
      if (walletRes.status === "fulfilled") {
        const bal = walletRes.value?.wallet?.balance ?? walletRes.value?.balance ?? 0;
        setWalletBalance(Number(bal) || 0);
      }

      const targetAssocId =
        selectedAssoc !== "all" ? selectedAssoc : loadedAssocs[0]?.id;
      if (targetAssocId) {
        try {
          const hist = await apiGet<HistoryResponse>(
            `/associations/${targetAssocId}/history?pageSize=5`
          );
          if (Array.isArray(hist?.events)) {
            setRecentEvents(hist.events.slice(0, 5));
          }
        } catch {
          // ignore if history unavailable
        }
      }
    } finally {
      setRefreshing(false);
    }
  }, [selectedAssoc]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const KPIS = [
    { label: "Mes Tontines", value: String(tontineCount), icon: "💰", color: colors.primary },
    {
      label: "Portefeuille",
      value: walletBalance >= 1000 ? `${Math.round(walletBalance / 1000)}k F` : `${walletBalance} F`,
      icon: "🏦",
      color: colors.secondary,
    },
    { label: "Prêts Actifs", value: String(loansCount), icon: "🤝", color: colors.terracotta },
    { label: "Score Réput.", value: String(user.score ?? 0), icon: "🏆", color: colors.info },
  ];

  const handleSelectAssoc = (id: string) => {
    setSelectedAssoc(id);
    setSelectedAssociation(id === "all" ? null : id).catch(() => {});
  };

  const activeAssoc = associations.find((a) => a.id === selectedAssoc) ?? associations[0];
  const nextMeeting = activeAssoc?.nextMeeting;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
    >
      {/* Header with Association Selector */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.topRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.welcome}>Bonjour, {user.name.split(" ")[0]} 👋</Text>
            <Text style={styles.status}>
              {selectedAssoc !== "all" && activeAssoc
                ? `${(ASSOC_TYPE_META[activeAssoc.type as AssocType] ?? ASSOC_TYPE_META.OTHER).icon} ${(ASSOC_TYPE_META[activeAssoc.type as AssocType] ?? ASSOC_TYPE_META.OTHER).label} · ${getMemberCount(activeAssoc)} membres`
                : `${associations.length} association(s) · www.tchoua.com`}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Wallet")}
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 13 }}>👛</Text>
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "800" }}>
                {walletBalance.toLocaleString("fr-FR")} FCFA
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatar}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.assocSelector}
          contentContainerStyle={styles.assocContent}
        >
          <TouchableOpacity
            onPress={() => handleSelectAssoc("all")}
            style={[styles.assocBadge, selectedAssoc === "all" && styles.assocBadgeActive]}
          >
            <Text style={[styles.assocText, selectedAssoc === "all" && { color: colors.primary, fontWeight: "900" }]}>
              Toutes
            </Text>
          </TouchableOpacity>
          {associations.map((a) => {
            const active = selectedAssoc === a.id;
            const meta = ASSOC_TYPE_META[a.type as AssocType] ?? ASSOC_TYPE_META.OTHER;
            return (
              <TouchableOpacity
                key={a.id}
                onPress={() => handleSelectAssoc(a.id)}
                style={[styles.assocBadge, active && styles.assocBadgeActive]}
              >
                <Text style={[styles.assocText, active && { color: colors.primary, fontWeight: "900" }]}>
                  {meta.icon} {a.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* KPI Grid */}
      <View style={styles.grid}>
        {KPIS.map((kpi, i) => (
          <View key={i} style={[styles.kpiCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.iconBox, { backgroundColor: kpi.color + "15" }]}>
              <Text style={styles.kpiIcon}>{kpi.icon}</Text>
            </View>
            <Text style={[styles.kpiValue, { color: colors.text }]}>{kpi.value}</Text>
            <Text style={[styles.kpiLabel, { color: colors.gray }]}>{kpi.label}</Text>
          </View>
        ))}
      </View>

      {/* Next Session Card */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Prochaine Réunion</Text>
          <TouchableOpacity onPress={() => navigation?.navigate?.("calendar")}>
            <Text style={[styles.seeAll, { color: colors.secondary }]}>Voir calendrier</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.sessionCard, { backgroundColor: colors.surface }]}
          onPress={() => navigation?.navigate?.("sessions")}
        >
          {nextMeeting ? (
            <>
              <View style={[styles.sessionDate, { backgroundColor: colors.primary + "12" }]}>
                <Text style={[styles.dateDay, { color: colors.primary }]}>
                  {new Date(nextMeeting.scheduledAt).getDate()}
                </Text>
                <Text style={[styles.dateMonth, { color: colors.primary }]}>
                  {new Date(nextMeeting.scheduledAt).toLocaleDateString("fr-FR", { month: "short" }).toUpperCase()}
                </Text>
              </View>
              <View style={styles.sessionInfo}>
                <Text style={[styles.sessionTitleText, { color: colors.text }]}>{nextMeeting.title}</Text>
                <Text style={[styles.sessionLocation, { color: colors.gray }]}>{activeAssoc?.name}</Text>
                <Text style={[styles.sessionTime, { color: colors.primary }]}>
                  🕒 {new Date(nextMeeting.scheduledAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.sessionInfo}>
              <Text style={[styles.sessionTitleText, { color: colors.text }]}>Aucune réunion planifiée</Text>
              <Text style={[styles.sessionLocation, { color: colors.gray }]}>
                Tirez vers le bas pour actualiser depuis www.tchoua.com
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Activités Récentes</Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity onPress={() => navigation?.navigate?.("interets")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Intérêts</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation?.navigate?.("historique")}>
              <Text style={[styles.seeAll, { color: colors.secondary }]}>Historique</Text>
            </TouchableOpacity>
          </View>
        </View>
        {recentEvents.length === 0 ? (
          <Text style={{ color: colors.gray, fontSize: 13 }}>
            Aucun mouvement récent pour le moment.
          </Text>
        ) : (
          recentEvents.map((ev) => (
            <TouchableOpacity
              key={ev.id}
              style={[styles.activityItem, { backgroundColor: colors.surface }]}
              onPress={() => navigation?.navigate?.("historique")}
            >
              <View style={[styles.activityIcon, { backgroundColor: colors.background }]}>
                <Text style={{ fontSize: 18 }}>
                  {ev.type === "INTEREST" ? "✨" : ev.type === "REPAYMENT" ? "🏦" : ev.type === "LOAN" ? "💳" : "💸"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>{ev.label}</Text>
                <Text style={[styles.activityDate, { color: colors.gray }]}>
                  {new Date(ev.date).toLocaleDateString("fr-FR")}
                </Text>
              </View>
              <Text style={[styles.activityAmount, { color: ev.direction === "IN" ? colors.success : colors.danger }]}>
                {ev.direction === "IN" ? "+" : "-"}
                {Math.round(ev.amount).toLocaleString("fr-FR")} F
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
      
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  welcome: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.white,
  },
  status: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
    marginTop: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 18,
  },
  assocSelector: {
    paddingLeft: SPACING.lg,
  },
  assocContent: {
    paddingRight: SPACING.xl,
    gap: 10,
  },
  assocBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  assocBadgeActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  assocText: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "700",
    fontSize: 13,
  },
  assocTextActive: {
    color: COLORS.white,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: SPACING.md,
    gap: 12,
    marginTop: -20,
  },
  kpiCard: {
    width: (width - SPACING.md * 2 - 12) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  kpiIcon: {
    fontSize: 20,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.black,
  },
  kpiLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: "600",
    marginTop: 2,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.secondary,
  },
  sessionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOW.sm,
  },
  sessionDate: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  dateDay: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.primary,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.secondary,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitleText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 4,
  },
  sessionLocation: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  sessionTime: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "700",
  },
  countdown: {
    backgroundColor: COLORS.danger + "15",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  countdownValue: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.danger,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 20,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.black,
  },
  activityDate: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: "900",
  },
});
