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

export const AcademieScreen = ({ navigation }: any) => {
  const COURSES = [
    { title: "Bases de la Tontine", cat: "Finance", level: "Débutant", duration: "15 min", progress: 1.0, icon: "📖" },
    { title: "Gestion d'Association", cat: "Gestion", level: "Intermédiaire", duration: "45 min", progress: 0.45, icon: "🏛️" },
    { title: "Droit & Réglementation", cat: "Légal", level: "Avancé", duration: "30 min", progress: 0, icon: "⚖️" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Académie Tchoua</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Apprenez & Évoluez</Text>
        <Text style={styles.heroDesc}>Des formations gratuites pour maîtriser la gestion financière et associative.</Text>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Rechercher un cours...</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes Cours</Text>
          <Text style={styles.seeAll}>Historique</Text>
        </View>
        {COURSES.map((course, i) => (
          <TouchableOpacity key={i} style={styles.courseCard}>
            <View style={styles.courseIcon}>
              <Text style={{ fontSize: 32 }}>{course.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.courseMeta}>
                <Text style={styles.courseCat}>{course.cat}</Text>
                <Text style={styles.courseLevel}>{course.level}</Text>
              </View>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <View style={styles.progressRow}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${course.progress * 100}%` }]} />
                </View>
                <Text style={styles.duration}>🕒 {course.duration}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bibliothèque</Text>
        <View style={styles.grid}>
          {["Guide Tontine", "Modèles PV", "Lexique Financier", "Statuts Types"].map((item, i) => (
            <TouchableOpacity key={i} style={styles.docCard}>
              <Text style={styles.docIcon}>📄</Text>
              <Text style={styles.docLabel}>{item}</Text>
              <Text style={styles.docMeta}>PDF · 1.2 Mo</Text>
            </TouchableOpacity>
          ))}
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
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 12,
    borderRadius: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
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
  courseCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    alignItems: "center",
    ...SHADOW.sm,
  },
  courseIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  courseMeta: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  courseCat: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.secondary,
    textTransform: "uppercase",
  },
  courseLevel: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.gray,
    textTransform: "uppercase",
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.success,
    borderRadius: 3,
  },
  duration: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.gray,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  docCard: {
    width: (width - SPACING.lg * 2 - 12) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  docIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  docLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 4,
  },
  docMeta: {
    fontSize: 10,
    color: COLORS.gray,
  },
});
