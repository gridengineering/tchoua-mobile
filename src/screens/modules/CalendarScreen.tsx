import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { COLORS, SPACING, SHADOW } from "../../theme";

const EVENTS = [
  { id: "1", date: "12 Mai", type: "meeting", title: "Réunion Mensuelle Ndi", time: "15:00", amount: null },
  { id: "2", date: "15 Mai", type: "payment", title: "Cotisation Épargne", time: "00:00", amount: "- 10 000 FCFA" },
  { id: "3", date: "20 Mai", type: "receive", title: "Tirage Tontine", time: "18:00", amount: "+ 250 000 FCFA" },
];

export const CalendarScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendrier Financier</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.monthCard}>
          <View style={styles.monthHeader}>
            <Text style={styles.monthText}>Mai 2026</Text>
            <View style={styles.monthStats}>
              <Text style={styles.statIn}>+ 250k</Text>
              <Text style={styles.statOut}>- 10k</Text>
            </View>
          </View>
          {/* Mock Calendar Grid */}
          <View style={styles.calendarGrid}>
            {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
              <Text key={i} style={styles.dayHeader}>{d}</Text>
            ))}
            {Array.from({ length: 31 }).map((_, i) => {
              const day = i + 1;
              const hasMeeting = day === 12;
              const hasPayment = day === 15;
              const hasReceive = day === 20;

              return (
                <View key={day} style={styles.dayCell}>
                  <Text style={styles.dayText}>{day}</Text>
                  <View style={styles.dots}>
                    {hasMeeting && <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />}
                    {hasPayment && <View style={[styles.dot, { backgroundColor: COLORS.danger }]} />}
                    {hasReceive && <View style={[styles.dot, { backgroundColor: COLORS.success }]} />}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prochains Événements</Text>
          {EVENTS.map(ev => (
            <View key={ev.id} style={styles.eventItem}>
              <View style={styles.eventDateBox}>
                <Text style={styles.eventDate}>{ev.date.split(' ')[0]}</Text>
                <Text style={styles.eventMonth}>{ev.date.split(' ')[1]}</Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>{ev.title}</Text>
                <Text style={styles.eventTime}>{ev.time}</Text>
              </View>
              {ev.amount && (
                <Text style={[styles.eventAmount, { color: ev.amount.startsWith("+") ? COLORS.success : COLORS.danger }]}>
                  {ev.amount}
                </Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    ...SHADOW.sm,
  },
  backBtn: { padding: SPACING.sm },
  backText: { color: COLORS.primary, fontWeight: "bold" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.black },
  content: { padding: SPACING.md },
  monthCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    ...SHADOW.md,
    marginBottom: SPACING.lg,
  },
  monthHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.md },
  monthText: { fontSize: 18, fontWeight: "bold", color: COLORS.primary },
  monthStats: { flexDirection: "row", gap: SPACING.sm },
  statIn: { color: COLORS.success, fontWeight: "bold" },
  statOut: { color: COLORS.danger, fontWeight: "bold" },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around" },
  dayHeader: { width: "14%", textAlign: "center", fontWeight: "bold", color: COLORS.gray, marginBottom: SPACING.sm },
  dayCell: { width: "14%", aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  dayText: { fontSize: 14, color: COLORS.black },
  dots: { flexDirection: "row", marginTop: 2, gap: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  section: { backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.md, ...SHADOW.sm },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.black, marginBottom: SPACING.md },
  eventItem: { flexDirection: "row", alignItems: "center", paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  eventDateBox: { width: 50, height: 50, backgroundColor: COLORS.background, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: SPACING.md },
  eventDate: { fontSize: 18, fontWeight: "bold", color: COLORS.primary },
  eventMonth: { fontSize: 10, color: COLORS.gray, textTransform: "uppercase" },
  eventDetails: { flex: 1 },
  eventTitle: { fontSize: 14, fontWeight: "600", color: COLORS.black },
  eventTime: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  eventAmount: { fontSize: 14, fontWeight: "bold" },
});
