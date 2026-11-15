import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiGet, apiPost, getSelectedAssociation } from "../../api/client";
import { useTheme } from "../../context/ThemeContext";
import { SHADOW, SPACING } from "../../theme";
import { showAlert } from "../../utils/feedback";

export const EvenementsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");

  const loadEvents = useCallback(async () => {
    try {
      const res = await apiGet<any[]>("/events");
      setEvents(Array.isArray(res) ? res : []);
    } catch {
      // Keep cached
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const toggleRsvp = async (id: string) => {
    try {
      await apiPost(`/events/${id}/rsvp`, { status: "GOING" });
      showAlert("Participation enregistrée", "Votre réponse a été enregistrée.");
      loadEvents();
    } catch (err: any) {
      showAlert("Erreur", err?.message || "Impossible de mettre à jour la participation.");
    }
  };

  const createEvent = async () => {
    const assocId = await getSelectedAssociation();
    if (!assocId || !title.trim()) {
      showAlert("Champs requis", "Sélectionnez une association et saisissez un titre.");
      return;
    }
    try {
      await apiPost("/events", {
        tontineId: assocId,
        title: title.trim(),
        startDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        location: location.trim() || "À définir",
      });
      setModalVisible(false);
      setTitle("");
      setLocation("");
      loadEvents();
    } catch (err: any) {
      showAlert("Erreur", err?.message || "Impossible de créer l'événement.");
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadEvents();
          }}
        />
      }
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.lightGray },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text, flex: 1 }]}>Événements</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.addBtnText}>+ Créer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
        ) : events.length === 0 ? (
          <Text style={[styles.empty, { color: colors.gray }]}>Aucun événement à venir.</Text>
        ) : (
          events.map((ev) => (
            <View key={ev.id} style={[styles.card, { backgroundColor: colors.surface }]}>
              <Text style={[styles.evTitle, { color: colors.text }]}>{ev.title}</Text>
              <Text style={[styles.evMeta, { color: colors.gray }]}>
                {new Date(ev.startDate).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}{" "}
                · {ev.location || "En ligne"}
              </Text>
              <View style={styles.row}>
                <Text style={[styles.attendees, { color: colors.gray }]}>
                  👥 {ev._count?.attendees ?? ev.attendees?.length ?? 0} participant(s)
                </Text>
                <TouchableOpacity
                  onPress={() => toggleRsvp(ev.id)}
                  style={[styles.rsvpBtn, { backgroundColor: colors.secondary }]}
                >
                  <Text style={styles.rsvpText}>Je participe</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Nouvel événement</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.lightGray }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Titre de l'événement"
              placeholderTextColor={colors.gray}
            />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.lightGray }]}
              value={location}
              onChangeText={setLocation}
              placeholder="Lieu"
              placeholderTextColor={colors.gray}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={{ color: colors.gray, fontWeight: "700" }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={createEvent}
                style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: "#fff", fontWeight: "800" }}>Publier</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: { marginRight: SPACING.md },
  backText: { fontSize: 16, fontWeight: "700" },
  title: { fontSize: 20, fontWeight: "900" },
  addBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  list: { padding: SPACING.lg },
  empty: { textAlign: "center", marginTop: 24, fontSize: 14 },
  card: {
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  evTitle: { fontSize: 16, fontWeight: "800" },
  evMeta: { fontSize: 12, marginTop: 4 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  attendees: { fontSize: 12, fontWeight: "700" },
  rsvpBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  rsvpText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: SPACING.lg },
  modalCard: { borderRadius: 20, padding: SPACING.lg },
  modalTitle: { fontSize: 16, fontWeight: "900", marginBottom: SPACING.md },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: SPACING.sm },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: SPACING.sm },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  confirmBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
});
