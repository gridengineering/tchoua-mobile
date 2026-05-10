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

export const SessionsScreen = ({ navigation }: any) => {
  const SESSIONS = [
    { title: "Réunion Mensuelle Mai", type: "AG", date: "15 Mai 2026", time: "15:00", location: "Foyer Bandjoun, Yaoundé", icon: "🏛️" },
    { title: "Tirage au sort Tontine A", type: "Tirage", date: "20 Mai 2026", time: "18:00", location: "Lien Visioconférence", icon: "🎲" },
    { title: "Session Épargne & Crédit", type: "Bureau", date: "02 Juin 2026", time: "10:00", location: "Bureau AMSED", icon: "💼" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Sessions & Tirage</Text>
      </View>

      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <Text style={styles.month}>Mai 2026</Text>
          <View style={styles.calendarNav}>
            <Text style={styles.navIcon}>‹</Text>
            <Text style={styles.navIcon}>›</Text>
          </View>
        </View>
        <View style={styles.daysRow}>
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <Text key={i} style={styles.dayLabel}>{d}</Text>
          ))}
        </View>
        <View style={styles.datesGrid}>
          {Array.from({ length: 31 }).map((_, i) => (
            <View key={i} style={[styles.dateCell, i + 1 === 15 && styles.dateCellActive]}>
              <Text style={[styles.dateText, i + 1 === 15 && styles.dateTextActive]}>{i + 1}</Text>
              {(i + 1 === 15 || i + 1 === 20) && <View style={styles.dot} />}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prochaines Sessions</Text>
        {SESSIONS.map((session, i) => (
          <TouchableOpacity key={i} style={styles.sessionItem}>
            <View style={styles.sessionIcon}>
              <Text style={{ fontSize: 24 }}>{session.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{session.title}</Text>
                <View style={styles.typeTag}>
                  <Text style={styles.typeTagText}>{session.type}</Text>
                </View>
              </View>
              <Text style={styles.itemMeta}>📅 {session.date} · 🕒 {session.time}</Text>
              <Text style={styles.itemLocation}>📍 {session.location}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.tirageAction}>
        <Text style={styles.tirageIcon}>🎲</Text>
        <Text style={styles.tirageText}>LANCER LE TIRAGE (EN DIRECT)</Text>
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
  calendarContainer: {
    backgroundColor: COLORS.white,
    margin: SPACING.lg,
    borderRadius: 24,
    padding: SPACING.lg,
    ...SHADOW.sm,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  month: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
  },
  calendarNav: {
    flexDirection: "row",
    gap: 20,
  },
  navIcon: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: "700",
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dayLabel: {
    width: (width - 120) / 7,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.gray,
  },
  datesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
  },
  dateCell: {
    width: (width - 120) / 7,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  dateCellActive: {
    backgroundColor: COLORS.primary,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
  },
  dateTextActive: {
    color: COLORS.white,
    fontWeight: "900",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.secondary,
    position: "absolute",
    bottom: 6,
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
  sessionItem: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.black,
    flex: 1,
  },
  typeTag: {
    backgroundColor: COLORS.secondary + "15",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeTagText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.secondary,
  },
  itemMeta: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: "600",
    marginBottom: 2,
  },
  itemLocation: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "700",
  },
  tirageAction: {
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
  tirageIcon: {
    fontSize: 24,
  },
  tirageText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 1,
  },
});
