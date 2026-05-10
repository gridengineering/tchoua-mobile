import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { COLORS, SPACING, SHADOW } from "../theme";

const { width } = Dimensions.get("window");

export const HomeScreen = () => {
  const KPIS = [
    { label: "Mes Tontines", value: "3", icon: "💰", color: COLORS.primary },
    { label: "Épargne Totale", value: "145k F", icon: "🏦", color: COLORS.secondary },
    { label: "Prêts Actifs", value: "1", icon: "🤝", color: COLORS.terracotta },
    { label: "Score Réput.", value: "850", icon: "🏆", color: COLORS.info },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Association Selector */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.welcome}>Bonjour, Marie 👋</Text>
            <Text style={styles.status}>Membre Premium · Yaoundé</Text>
          </View>
          <TouchableOpacity style={styles.avatar}>
            <Text style={styles.avatarText}>M</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.assocSelector}
          contentContainerStyle={styles.assocContent}
        >
          <TouchableOpacity style={[styles.assocBadge, styles.assocBadgeActive]}>
            <Text style={[styles.assocText, styles.assocTextActive]}>Toutes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.assocBadge}>
            <Text style={styles.assocText}>AMSED</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.assocBadge}>
            <Text style={styles.assocText}>Fonds NDI MBE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.assocBadge}>
            <Text style={styles.assocText}>Association A30</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* KPI Grid */}
      <View style={styles.grid}>
        {KPIS.map((kpi, i) => (
          <View key={i} style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: kpi.color + "15" }]}>
              <Text style={styles.kpiIcon}>{kpi.icon}</Text>
            </View>
            <Text style={styles.kpiValue}>{kpi.value}</Text>
            <Text style={styles.kpiLabel}>{kpi.label}</Text>
          </View>
        ))}
      </View>

      {/* Next Session Card */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Prochaine Réunion</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Voir calendrier</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.sessionCard}>
          <View style={styles.sessionDate}>
            <Text style={styles.dateDay}>15</Text>
            <Text style={styles.dateMonth}>MAI</Text>
          </View>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTitleText}>AG Mensuelle - AMSED</Text>
            <Text style={styles.sessionLocation}>📍 Foyer Bandjoun, Yaoundé</Text>
            <Text style={styles.sessionTime}>🕒 15:00 — 19:00</Text>
          </View>
          <View style={styles.countdown}>
            <Text style={styles.countdownValue}>J-7</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activités Récentes</Text>
        {[
          { t: "Cotisation Tontine A", a: "+25 000 F", d: "Hier, 18:30", i: "💸" },
          { t: "Remboursement Prêt", a: "-10 000 F", d: "2 mai 2026", i: "💳" },
          { t: "Aide Solidarité (Naiss.)", a: "+50 000 F", d: "28 avr. 2026", i: "👶" },
        ].map((item, i) => (
          <View key={i} style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Text style={{ fontSize: 18 }}>{item.i}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.activityTitle}>{item.t}</Text>
              <Text style={styles.activityDate}>{item.d}</Text>
            </View>
            <Text style={[styles.activityAmount, { color: item.a.includes("+") ? COLORS.success : COLORS.danger }]}>
              {item.a}
            </Text>
          </View>
        ))}
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
