import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiGet, getSelectedAssociation } from "../../api/client";
import { COLORS, SHADOW, SPACING } from "../../theme";

type CalendarEvent = {
  id: string;
  date: string;
  day: number;
  type: string;
  title: string;
  time: string;
  amount: string | null;
};

export const CalendarScreen = ({ navigation }: any) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCalendar = useCallback(async () => {
    try {
      const assocId = await getSelectedAssociation();
      const query = assocId ? `?associationId=${assocId}` : "";
      const res = await apiGet<{ events: any[] }>(`/calendar${query}`);
      const mapped: CalendarEvent[] = (res.events ?? []).map((ev) => {
        const dt = new Date(ev.date || ev.scheduledAt || ev.startDate || Date.now());
        return {
          id: String(ev.id),
          date: dt.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
          day: dt.getDate(),
          type: ev.type || "meeting",
          title: ev.title || "Échéance",
          time: dt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          amount: ev.amount ? `${Number(ev.amount).toLocaleString("fr-FR")} FCFA` : null,
        };
      });
      setEvents(mapped);
    } catch {
      // Fallback empty on offline
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  const meetingDays = new Set(events.filter((e) => e.type === "meeting").map((e) => e.day));
  const paymentDays = new Set(events.filter((e) => e.type === "payment" || e.type === "contribution").map((e) => e.day));
  const receiveDays = new Set(events.filter((e) => e.type === "receive" || e.type === "session").map((e) => e.day));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendrier Financier</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadCalendar();
            }}
          />
        }
      >
        <View style={styles.monthCard}>
          <View style={styles.monthHeader}>
            <Text style={styles.monthText}>
              {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </Text>
            <Text style={styles.statIn}>{events.length} échéance(s)</Text>
          </View>
          <View style={styles.calendarGrid}>
            {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
              <Text key={i} style={styles.dayHeader}>{d}</Text>
            ))}
            {Array.from({ length: 31 }).map((_, i) => {
              const day = i + 1;
              return (
                <View key={day} style={styles.dayCell}>
                  <Text style={styles.dayText}>{day}</Text>
                  <View style={styles.dots}>
                    {meetingDays.has(day) && <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />}
                    {paymentDays.has(day) && <View style={[styles.dot, { backgroundColor: COLORS.danger }]} />}
                    {receiveDays.has(day) && <View style={[styles.dot, { backgroundColor: COLORS.success }]} />}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Prochaines Échéances</Text>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : events.length === 0 ? (
          <Text style={styles.empty}>Aucune échéance planifiée pour le moment.</Text>
        ) : (
          events.map((ev) => (
            <View key={ev.id} style={styles.eventCard}>
              <View style={styles.dateBox}>
                <Text style={styles.dateBoxText}>{ev.date}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventTitle}>{ev.title}</Text>
                <Text style={styles.eventTime}>{ev.time}</Text>
              </View>
              {ev.amount && (
                <Text
                  style={[
                    styles.eventAmount,
                    { color: ev.type === "receive" ? COLORS.success : COLORS.danger },
                  ]}
                >
                  {ev.amount}
                </Text>
              )}
            </View>
          ))
        )}
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
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 15, fontWeight: "700", color: COLORS.primary },
  headerTitle: { fontSize: 18, fontWeight: "900", color: COLORS.text },
  content: { padding: SPACING.lg },
  monthCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    ...SHADOW.sm,
  },
  monthHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.md },
  monthText: { fontSize: 16, fontWeight: "800", color: COLORS.text, textTransform: "capitalize" },
  statIn: { fontSize: 13, fontWeight: "700", color: COLORS.success },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayHeader: { width: "14.28%", textAlign: "center", fontSize: 12, fontWeight: "700", color: COLORS.gray, marginBottom: 8 },
  dayCell: { width: "14.28%", height: 38, alignItems: "center", justifyContent: "center" },
  dayText: { fontSize: 13, color: COLORS.text, fontWeight: "600" },
  dots: { flexDirection: "row", gap: 3, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text, marginBottom: SPACING.md },
  empty: { textAlign: "center", color: COLORS.gray, marginTop: 12 },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  dateBox: {
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: SPACING.md,
  },
  dateBoxText: { fontSize: 12, fontWeight: "800", color: COLORS.primary },
  eventTitle: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  eventTime: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  eventAmount: { fontSize: 14, fontWeight: "800" },
});
