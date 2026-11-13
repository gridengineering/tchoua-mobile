import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { SHADOW, SPACING } from "../../theme";
import { showAlert } from "../../utils/feedback";

const INITIAL_EVENTS = [
  {
    id: "1",
    title: "Assemblée Générale Annuelle AMSED",
    date: "24 Mai 2026 · 14:00",
    location: "Foyer Bandjoun, Yaoundé",
    going: true,
    attendees: 34,
  },
  {
    id: "2",
    title: "Gala de Solidarité AMEIBANS",
    date: "12 Juin 2026 · 19:00",
    location: "Hôtel Mont Fébé",
    going: false,
    attendees: 78,
  },
];

export const EvenementsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");

  const toggleRsvp = (id: string) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === id
          ? {
              ...ev,
              going: !ev.going,
              attendees: ev.going ? ev.attendees - 1 : ev.attendees + 1,
            }
          : ev
      )
    );
  };

  const handleCreate = () => {
    if (!title.trim()) {
      showAlert("Champ requis", "Veuillez saisir un titre d'événement.");
      return;
    }
    setEvents((prev) => [
      {
        id: String(Date.now()),
        title: title.trim(),
        date: date.trim() || "À planifier",
        location: location.trim() || "En ligne / Siège",
        going: true,
        attendees: 1,
      },
      ...prev,
    ]);
    setTitle("");
    setDate("");
    setLocation("");
    setModalVisible(false);
    showAlert("Événement créé", "L'événement a été ajouté au calendrier de l'association.");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
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
        <Text style={[styles.title, { color: colors.text }]}>Événements</Text>
      </View>

      <View style={styles.list}>
        {events.map((ev) => (
          <View key={ev.id} style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.evTitle, { color: colors.text }]}>{ev.title}</Text>
            <Text style={[styles.evMeta, { color: colors.gray }]}>📅 {ev.date}</Text>
            <Text style={[styles.evMeta, { color: colors.gray }]}>📍 {ev.location}</Text>
            <View style={styles.footerRow}>
              <Text style={[styles.attendees, { color: colors.primary }]}>
                👥 {ev.attendees} participant(s)
              </Text>
              <TouchableOpacity
                onPress={() => toggleRsvp(ev.id)}
                style={[
                  styles.rsvpBtn,
                  { backgroundColor: ev.going ? colors.success : colors.primary },
                ]}
              >
                <Text style={styles.rsvpText}>{ev.going ? "✓ Inscrit" : "Participer"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[styles.addBtn, { borderColor: colors.primary }]}
        >
          <Text style={[styles.addBtnText, { color: colors.primary }]}>
            + Créer un événement
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Nouvel événement</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.lightGray, color: colors.text }]}
              placeholder="Titre de l'événement"
              placeholderTextColor={colors.gray}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, { borderColor: colors.lightGray, color: colors.text }]}
              placeholder="Date et heure (ex: 30 Juin 2026 · 15:00)"
              placeholderTextColor={colors.gray}
              value={date}
              onChangeText={setDate}
            />
            <TextInput
              style={[styles.input, { borderColor: colors.lightGray, color: colors.text }]}
              placeholder="Lieu"
              placeholderTextColor={colors.gray}
              value={location}
              onChangeText={setLocation}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalBtn, { backgroundColor: colors.lightGray }]}
              >
                <Text style={{ color: colors.text, fontWeight: "700" }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreate}
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: "#fff", fontWeight: "800" }}>Créer</Text>
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
  list: { padding: SPACING.lg },
  card: { borderRadius: 18, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOW.sm },
  evTitle: { fontSize: 16, fontWeight: "900", marginBottom: 6 },
  evMeta: { fontSize: 13, marginBottom: 3 },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.md,
  },
  attendees: { fontSize: 12, fontWeight: "800" },
  rsvpBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  rsvpText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  addBtn: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  addBtnText: { fontWeight: "800", fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: SPACING.lg,
  },
  modalCard: { borderRadius: 20, padding: SPACING.lg },
  modalTitle: { fontSize: 18, fontWeight: "900", marginBottom: SPACING.md },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: SPACING.sm,
    fontSize: 14,
  },
  modalActions: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.sm },
  modalBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: "center" },
});
