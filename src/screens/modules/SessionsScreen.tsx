import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiGet, apiOnline, getSelectedAssociation } from "../../api/client";
import { COLORS, SHADOW, SPACING } from "../../theme";
import { showAlert } from "../../utils/feedback";

type MeetingItem = {
  id: string;
  title: string;
  type: string;
  date: string;
  location: string;
  status: string;
};

type UpcomingSession = {
  sessionId: string;
  activityId: string;
  activityName: string;
  sessionNumber: number;
  distributionMode: string;
};

export const SessionsScreen = ({ navigation }: any) => {
  const [assocId, setAssocId] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [upcomingSession, setUpcomingSession] = useState<UpcomingSession | null>(null);
  const [lastWinner, setLastWinner] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [designating, setDesignating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const selectedId = await getSelectedAssociation();
      if (!selectedId) {
        setMeetings([]);
        setUpcomingSession(null);
        return;
      }
      setAssocId(selectedId);

      const [meetRes, actRes] = await Promise.all([
        apiGet<{ meetings?: any[] }>(`/associations/${selectedId}/meetings`).catch(() => ({ meetings: [] })),
        apiGet<{ activities?: any[] }>(`/associations/${selectedId}/activities`).catch(() => ({ activities: [] })),
      ]);

      const mappedMeetings: MeetingItem[] = (meetRes.meetings ?? []).map((m) => ({
        id: m.id,
        title: m.title || `Réunion ${m.type || "Statutaire"}`,
        type: m.type || "REGULAR",
        date: new Date(m.scheduledAt).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        location: m.location || "En ligne / Siège",
        status: m.status || "SCHEDULED",
      }));
      setMeetings(mappedMeetings);

      const tontine = (actRes.activities ?? []).find((a) =>
        String(a.type || "").startsWith("TONTINE")
      );
      if (tontine) {
        const sessRes = await apiGet<{ sessions?: any[] }>(
          `/associations/${selectedId}/activities/${tontine.id}/sessions`
        ).catch(() => ({ sessions: [] }));
        const nextSess = (sessRes.sessions ?? []).find((s) => s.status === "UPCOMING");
        if (nextSess) {
          setUpcomingSession({
            sessionId: nextSess.id,
            activityId: tontine.id,
            activityName: tontine.name,
            sessionNumber: nextSess.sessionNumber,
            distributionMode: tontine.distributionMode || "ROTATION",
          });
        } else {
          setUpcomingSession(null);
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const runServerDesignation = async (finalize: boolean) => {
    if (!assocId || !upcomingSession) {
      showAlert("Aucune séance", "Aucune séance de tontine à venir trouvée.");
      return;
    }
    setDesignating(true);
    try {
      const res = await apiOnline<any>(
        `/associations/${assocId}/activities/${upcomingSession.activityId}/sessions/${upcomingSession.sessionId}/designate`,
        { finalize },
        "POST"
      );
      const label = `${res.winner.name} (${res.proof.algorithm}, ${Number(res.netDistributed).toLocaleString("fr-FR")} F)`;
      setLastWinner(label);
      showAlert(
        finalize ? "Bénéficiaire validé" : "Prévisualisation R1",
        `Bénéficiaire : ${res.winner.name}\nMode : ${res.proof.algorithm}\nMontant net : ${Number(res.netDistributed).toLocaleString("fr-FR")} F\nPreuve : ${String(res.proof.hash).slice(0, 12)}...`
      );
      if (finalize) loadData();
    } catch (err: any) {
      showAlert("Erreur désignation", err?.message || "Impossible de désigner le bénéficiaire.");
    } finally {
      setDesignating(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadData();
          }}
        />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Sessions & Désignation</Text>
      </View>

      <View style={styles.drawCard}>
        <Text style={styles.drawTitle}>
          {upcomingSession
            ? `🎲 ${upcomingSession.activityName} — Séance #${upcomingSession.sessionNumber}`
            : "🎲 Désignation automatique (R1)"}
        </Text>
        <Text style={styles.drawSub}>
          {upcomingSession
            ? `Mode actif : ${upcomingSession.distributionMode} (calcul & preuve côté serveur)`
            : "Aucune séance UPCOMING en attente de bénéficiaire."}
        </Text>
        {lastWinner && <Text style={styles.winnerText}>Résultat : {lastWinner}</Text>}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.drawBtn, { backgroundColor: COLORS.secondary }]}
            disabled={designating || !upcomingSession}
            onPress={() => runServerDesignation(false)}
          >
            <Text style={styles.drawBtnText}>{designating ? "..." : "Simuler"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.drawBtn, { backgroundColor: COLORS.success }]}
            disabled={designating || !upcomingSession}
            onPress={() => runServerDesignation(true)}
          >
            <Text style={styles.drawBtnText}>Valider</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Réunions de l'association</Text>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : meetings.length === 0 ? (
          <Text style={styles.empty}>Aucune réunion enregistrée.</Text>
        ) : (
          meetings.map((s) => (
            <View key={s.id} style={styles.sessionCard}>
              <View style={styles.iconBox}>
                <Text style={{ fontSize: 22 }}>🏛️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sessionTitle}>{s.title}</Text>
                <Text style={styles.sessionMeta}>
                  {s.date} · {s.location}
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{s.status}</Text>
              </View>
            </View>
          ))
        )}
      </View>
      <View style={{ height: 80 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: { marginRight: SPACING.md },
  backText: { fontSize: 16, fontWeight: "700", color: COLORS.primary },
  title: { fontSize: 20, fontWeight: "900", color: COLORS.text },
  drawCard: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    ...SHADOW.md,
  },
  drawTitle: { color: "#fff", fontSize: 16, fontWeight: "900" },
  drawSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4 },
  winnerText: { color: "#fde68a", fontSize: 13, fontWeight: "800", marginTop: 8 },
  btnRow: { flexDirection: "row", gap: 10, marginTop: SPACING.md },
  drawBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
  },
  drawBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  section: { paddingHorizontal: SPACING.lg },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: COLORS.text, marginBottom: SPACING.sm },
  empty: { textAlign: "center", color: COLORS.gray, marginTop: 20 },
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  sessionTitle: { fontSize: 14, fontWeight: "800", color: COLORS.text },
  sessionMeta: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  badge: {
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 11, fontWeight: "800", color: COLORS.primary },
});
