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

export const PretsScreen = ({ navigation }: any) => {
  const LOANS = [
    { label: "Prêt Scolaire", amount: "200 000 F", remaining: "85 000 F", nextDate: "15 Mai", status: "En cours", color: COLORS.success },
    { label: "Besoin Fond de Roulement", amount: "500 000 F", remaining: "500 000 F", nextDate: "Juin 2026", status: "Accordé", color: COLORS.info },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Prêts & Crédit</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Encours Total</Text>
          <Text style={styles.summaryValue}>585 000 F</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: COLORS.secondary + "15" }]}>
          <Text style={[styles.summaryLabel, { color: COLORS.secondary }]}>Capacité Prêt</Text>
          <Text style={[styles.summaryValue, { color: COLORS.secondary }]}>1.2M F</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes Prêts</Text>
        {LOANS.map((loan, i) => (
          <TouchableOpacity key={i} style={styles.loanItem}>
            <View style={styles.loanHeader}>
              <Text style={styles.loanLabel}>{loan.label}</Text>
              <View style={[styles.statusBadge, { backgroundColor: loan.color + "15" }]}>
                <Text style={[styles.statusText, { color: loan.color }]}>{loan.status}</Text>
              </View>
            </View>
            
            <View style={styles.loanBody}>
              <View>
                <Text style={styles.metaLabel}>Montant Initial</Text>
                <Text style={styles.metaValue}>{loan.amount}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.metaLabel}>Reste à payer</Text>
                <Text style={[styles.metaValue, { color: COLORS.danger }]}>{loan.remaining}</Text>
              </View>
            </View>

            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "60%", backgroundColor: loan.color }]} />
            </View>

            <View style={styles.loanFooter}>
              <Text style={styles.nextDate}>Prochaine échéance : {loan.nextDate}</Text>
              <TouchableOpacity style={styles.payNowBtn}>
                <Text style={styles.payNowText}>PAYER</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.requestBtn}>
        <Text style={styles.requestBtnIcon}>💳</Text>
        <Text style={styles.requestBtnText}>DEMANDER UN PRÊT</Text>
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
  summaryRow: {
    flexDirection: "row",
    padding: SPACING.lg,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 20,
    ...SHADOW.sm,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
  },
  section: {
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  loanItem: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  loanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  loanLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.black,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  loanBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  metaLabel: {
    fontSize: 10,
    color: COLORS.gray,
    fontWeight: "600",
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.black,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: SPACING.md,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  loanFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextDate: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: "600",
  },
  payNowBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  payNowText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
  },
  requestBtn: {
    margin: SPACING.lg,
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    ...SHADOW.md,
  },
  requestBtnIcon: {
    fontSize: 20,
    color: COLORS.white,
  },
  requestBtnText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: 1,
  },
});
