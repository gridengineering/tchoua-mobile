import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { COLORS, SPACING, SHADOW } from "../../theme";

const { width } = Dimensions.get("window");

export const EpargneScreen = ({ navigation }: any) => {
  const ACCOUNTS = [
    { label: "Épargne Libre", balance: "85 000 F", trend: "+12%", icon: "💰" },
    { label: "Fonds d'Urgence", balance: "150 000 F", trend: "+5%", icon: "🏥" },
    { label: "Épargne Projet (Terrain)", balance: "1 200 000 F", trend: "+25%", icon: "🏗️" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Épargne & Invest.</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Solde Total Épargné</Text>
        <Text style={styles.balanceValue}>1 435 000 FCFA</Text>
        <View style={styles.balanceFooter}>
          <View style={styles.trendBadge}>
            <Text style={styles.trendText}>▲ +8.5% ce mois</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes Comptes</Text>
        {ACCOUNTS.map((acc, i) => (
          <TouchableOpacity key={i} style={styles.accountItem}>
            <View style={styles.accountIcon}>
              <Text style={{ fontSize: 24 }}>{acc.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.accountLabel}>{acc.label}</Text>
              <Text style={styles.accountTrend}>{acc.trend} d'évolution</Text>
            </View>
            <Text style={styles.accountBalance}>{acc.balance}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionLabelBtn}>Verser</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.primary }]}>
          <Text style={[styles.actionIcon, { color: COLORS.primary }]}>💸</Text>
          <Text style={[styles.actionLabelBtn, { color: COLORS.primary }]}>Retirer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Objectifs d'Épargne</Text>
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>Achat Terrain Douala</Text>
            <Text style={styles.goalPercent}>60%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "60%" }]} />
          </View>
          <Text style={styles.goalMeta}>1 200 000 F / 2 000 000 F</Text>
        </View>
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
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: SPACING.md,
  },
  backText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.primary,
  },
  balanceCard: {
    margin: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: 32,
    padding: SPACING.xl,
    alignItems: "center",
    ...SHADOW.md,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  balanceValue: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: "900",
  },
  balanceFooter: {
    marginTop: 16,
  },
  trendBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  trendText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 12,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 20,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  accountLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.black,
  },
  accountTrend: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: "600",
    marginTop: 2,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.primary,
  },
  actionsRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    gap: 12,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionIcon: {
    fontSize: 18,
    color: COLORS.white,
  },
  actionLabelBtn: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 14,
  },
  goalCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: 24,
    ...SHADOW.sm,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.black,
  },
  goalPercent: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.secondary,
  },
  progressBar: {
    height: 10,
    backgroundColor: COLORS.background,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.secondary,
    borderRadius: 5,
  },
  goalMeta: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: "600",
    textAlign: "right",
  },
});
