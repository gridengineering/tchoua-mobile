import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { COLORS, SPACING, SHADOW } from "../theme";
import { CYCLE_MODE_LABELS, CycleMode, formatShareFraction } from "../types/association";

export const TontinesScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const TONTINES = [
    {
      id: "tontine-entrepreneurs",
      name: "Tontine des Entrepreneurs",
      type: "Enchères",
      period: "Mensuel",
      amount: "50 000 F",
      beneficiaryAmountPerShare: 550000,
      minShareFraction: 0.5,
      maxBeneficiarySharesPerSession: 2,
      cycleMode: "FIXED_SESSIONS" as CycleMode,
      progress: 0.65,
      status: "En cours",
      members: 12,
      nextDate: "15 Mai",
    },
    {
      id: "caisse-solidarite-famille",
      name: "Caisse de Solidarité Famille",
      type: "Classique",
      period: "Hebdo",
      amount: "5 000 F",
      beneficiaryAmountPerShare: 120000,
      minShareFraction: 1,
      maxBeneficiarySharesPerSession: 1,
      cycleMode: "UNTIL_ALL_BENEFITED" as CycleMode,
      progress: 0.9,
      status: "Actif",
      members: 24,
      nextDate: "Demain",
    },
    {
      id: "tontine-scolaire-a30",
      name: "Tontine Scolaire A30",
      type: "Tirage",
      period: "Mensuel",
      amount: "10 000 F",
      beneficiaryAmountPerShare: 300000,
      minShareFraction: 0.25,
      maxBeneficiarySharesPerSession: 3,
      cycleMode: "FIXED_PERIOD" as CycleMode,
      progress: 0.3,
      status: "En cours",
      members: 30,
      nextDate: "25 Mai",
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.lightGray }]}>
        <Text style={[styles.title, { color: colors.primary }]}>Mes Tontines</Text>
        <Text style={[styles.subtitle, { color: colors.gray }]}>Gérez vos cotisations, parts et cycles</Text>
      </View>

      <View style={styles.list}>
        {TONTINES.map((t, i) => (
          <View key={i} style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.typeBadge, { backgroundColor: colors.background }]}>
                <Text style={[styles.typeText, { color: colors.gray }]}>{t.type}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: t.status === "En cours" ? colors.success + "15" : colors.primary + "15" }]}>
                <Text style={[styles.statusText, { color: t.status === "En cours" ? colors.success : colors.primary }]}>{t.status}</Text>
              </View>
            </View>

            <Text style={[styles.name, { color: colors.text }]}>{t.name}</Text>

            <View style={[styles.details, { backgroundColor: colors.background }]}>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.gray }]}>Montant</Text>
                <Text style={[styles.detailValue, { color: colors.primary }]}>{t.amount}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.gray }]}>Membres</Text>
                <Text style={[styles.detailValue, { color: colors.primary }]}>{t.members}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.gray }]}>Échéance</Text>
                <Text style={[styles.detailValue, { color: colors.primary }]}>{t.nextDate}</Text>
              </View>
            </View>

            <View style={styles.flexBadges}>
              <View style={[styles.flexBadge, { backgroundColor: colors.primary + "12" }]}>
                <Text style={[styles.flexBadgeText, { color: colors.primary }]}>
                  {formatShareFraction(t.minShareFraction)}
                </Text>
              </View>
              <View style={[styles.flexBadge, { backgroundColor: colors.secondary + "15" }]}>
                <Text style={[styles.flexBadgeText, { color: colors.secondary }]}>
                  Part: {t.beneficiaryAmountPerShare.toLocaleString("fr-FR")} F
                </Text>
              </View>
              <View style={[styles.flexBadge, { backgroundColor: colors.background }]}>
                <Text style={[styles.flexBadgeText, { color: colors.gray }]}>
                  {CYCLE_MODE_LABELS[t.cycleMode]}
                </Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressInfo}>
                <Text style={[styles.progressLabel, { color: colors.gray }]}>Progression du cycle</Text>
                <Text style={[styles.progressPercent, { color: colors.primary }]}>{Math.round(t.progress * 100)}%</Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: colors.background }]}>
                <View style={[styles.progressFill, { width: `${t.progress * 100}%`, backgroundColor: colors.secondary }]} />
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={[styles.payButton, { flex: 1, backgroundColor: colors.primary }]}>
                <Text style={styles.payButtonText}>PAYER MA COTISATION</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cycleButton, { borderColor: colors.primary }]}
                onPress={() => navigation?.navigate?.("cycle_tontine", { activityId: t.id, name: t.name })}
              >
                <Text style={[styles.cycleButtonText, { color: colors.primary }]}>CYCLE</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>+ Rejoindre une tontine</Text>
      </TouchableOpacity>
      
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
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: "600",
    marginTop: 4,
  },
  list: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: SPACING.lg,
    ...SHADOW.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  typeBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.gray,
    textTransform: "uppercase",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  name: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.black,
    marginBottom: SPACING.lg,
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 20,
  },
  detailItem: {
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 10,
    color: COLORS.gray,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primary,
  },
  progressContainer: {
    marginBottom: SPACING.lg,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: "600",
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.secondary,
    borderRadius: 4,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  payButtonText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },
  flexBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: SPACING.md,
  },
  flexBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  flexBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  actionsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  cycleButton: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cycleButtonText: {
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },
  fab: {
    margin: SPACING.md,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderStyle: "dashed",
  },
  fabText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 15,
  },
});
