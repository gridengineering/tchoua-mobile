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

export const SolidariteScreen = ({ navigation }: any) => {
  const CAISSES = [
    { label: "Caisse Décès", icon: "🕊️", balance: "250k F", help: "Demander aide" },
    { label: "Caisse Naissance", icon: "👶", balance: "120k F", help: "Déclarer" },
    { label: "Caisse Mariage", icon: "💒", balance: "300k F", help: "Déclarer" },
    { label: "Caisse Santé", icon: "🏥", balance: "450k F", help: "Urgence" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Solidarité</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>La force du collectif</Text>
        <Text style={styles.heroDesc}>Découvrez et gérez les aides communautaires disponibles dans vos associations.</Text>
      </View>

      <View style={styles.grid}>
        {CAISSES.map((caisse, i) => (
          <TouchableOpacity key={i} style={styles.caisseCard}>
            <View style={styles.caisseIcon}>
              <Text style={{ fontSize: 32 }}>{caisse.icon}</Text>
            </View>
            <Text style={styles.caisseLabel}>{caisse.label}</Text>
            <Text style={styles.caisseBalance}>{caisse.balance}</Text>
            <TouchableOpacity style={styles.caisseAction}>
              <Text style={styles.caisseActionText}>{caisse.help}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demandes en cours</Text>
        <View style={styles.requestCard}>
          <View style={styles.requestHeader}>
            <Text style={styles.requestType}>🍼 Aide Naissance - J. Kamdem</Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Vérification</Text>
            </View>
          </View>
          <View style={styles.timeline}>
            <View style={[styles.timelineDot, styles.dotActive]} />
            <View style={[styles.timelineLine, styles.lineActive]} />
            <View style={[styles.timelineDot, styles.dotActive]} />
            <View style={styles.timelineLine} />
            <View style={styles.timelineDot} />
          </View>
          <View style={styles.timelineLabels}>
            <Text style={styles.labelActive}>Soumis</Text>
            <Text style={styles.labelActive}>Validé</Text>
            <Text>Payé</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.mainAction}>
        <Text style={styles.mainActionText}>+ CRÉER UNE NOUVELLE DEMANDE</Text>
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
  hero: {
    padding: SPACING.xl,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.white,
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: SPACING.md,
    gap: 12,
    marginTop: -20,
  },
  caisseCard: {
    width: (width - SPACING.md * 2 - 12) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.lg,
    alignItems: "center",
    ...SHADOW.sm,
  },
  caisseIcon: {
    marginBottom: SPACING.md,
  },
  caisseLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 4,
  },
  caisseBalance: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: "600",
    marginBottom: SPACING.md,
  },
  caisseAction: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  caisseActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.lg,
    ...SHADOW.sm,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  requestType: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.black,
    flex: 1,
  },
  tag: {
    backgroundColor: COLORS.warning + "15",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.warning,
  },
  timeline: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.lightGray,
  },
  dotActive: {
    backgroundColor: COLORS.success,
  },
  timelineLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.lightGray,
  },
  lineActive: {
    backgroundColor: COLORS.success,
  },
  timelineLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  labelActive: {
    color: COLORS.success,
    fontWeight: "700",
    fontSize: 11,
  },
  mainAction: {
    margin: SPACING.lg,
    backgroundColor: COLORS.terracotta,
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
    ...SHADOW.md,
  },
  mainActionText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 1,
  },
});
