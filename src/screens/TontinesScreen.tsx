import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { COLORS, SPACING, SHADOW } from "../theme";

export const TontinesScreen = () => {
  const TONTINES = [
    {
      name: "Tontine des Entrepreneurs",
      type: "Enchères",
      period: "Mensuel",
      amount: "50 000 F",
      progress: 0.65,
      status: "En cours",
      members: 12,
      nextDate: "15 Mai",
    },
    {
      name: "Caisse de Solidarité Famille",
      type: "Classique",
      period: "Hebdo",
      amount: "5 000 F",
      progress: 0.9,
      status: "Actif",
      members: 24,
      nextDate: "Demain",
    },
    {
      name: "Tontine Scolaire A30",
      type: "Tirage",
      period: "Mensuel",
      amount: "10 000 F",
      progress: 0.3,
      status: "En cours",
      members: 30,
      nextDate: "25 Mai",
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Tontines</Text>
        <Text style={styles.subtitle}>Gérez vos cotisations et bénéfices</Text>
      </View>

      <View style={styles.list}>
        {TONTINES.map((t, i) => (
          <TouchableOpacity key={i} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{t.type}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: t.status === "En cours" ? COLORS.success + "15" : COLORS.primary + "15" }]}>
                <Text style={[styles.statusText, { color: t.status === "En cours" ? COLORS.success : COLORS.primary }]}>{t.status}</Text>
              </View>
            </View>

            <Text style={styles.name}>{t.name}</Text>

            <View style={styles.details}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Montant</Text>
                <Text style={styles.detailValue}>{t.amount}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Membres</Text>
                <Text style={styles.detailValue}>{t.members}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Échéance</Text>
                <Text style={styles.detailValue}>{t.nextDate}</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressLabel}>Progression du cycle</Text>
                <Text style={styles.progressPercent}>{Math.round(t.progress * 100)}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${t.progress * 100}%` }]} />
              </View>
            </View>

            <TouchableOpacity style={styles.payButton}>
              <Text style={styles.payButtonText}>PAYER MA COTISATION</Text>
            </TouchableOpacity>
          </TouchableOpacity>
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
