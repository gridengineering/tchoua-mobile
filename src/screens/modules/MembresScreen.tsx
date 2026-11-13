import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { SHADOW, SPACING } from "../../theme";
import { showAlert } from "../../utils/feedback";

const INITIAL_MEMBERS = [
  { id: "1", name: "Marie Ngono", role: "Présidente", score: 98, status: "Actif", phone: "+237 699 00 11 22" },
  { id: "2", name: "Jean Mbarga", role: "Trésorier", score: 95, status: "Actif", phone: "+237 677 22 33 44" },
  { id: "3", name: "Pauline Fotso", role: "Secrétaire", score: 94, status: "Actif", phone: "+237 655 44 55 66" },
  { id: "4", name: "Samuel Kamdem", role: "Membre", score: 89, status: "Actif", phone: "+237 690 77 88 99" },
  { id: "5", name: "Clarisse Tchinda", role: "Membre", score: 92, status: "En attente", phone: "+237 670 12 34 56" },
];

export const MembresScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState(INITIAL_MEMBERS);

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.role.toLowerCase().includes(query.toLowerCase())
  );

  const approveMember = (id: string) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status: "Actif" } : m)));
    showAlert("Membre validé", "Le membre est maintenant actif dans l'association.");
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
        <Text style={[styles.title, { color: colors.text }]}>Membres ({members.length})</Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={[
            styles.searchInput,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.lightGray },
          ]}
          placeholder="Rechercher un membre ou rôle..."
          placeholderTextColor={colors.gray}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <View style={styles.list}>
        {filtered.map((m) => (
          <View key={m.id} style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + "15" }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {m.name.charAt(0)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.text }]}>{m.name}</Text>
              <Text style={[styles.meta, { color: colors.gray }]}>
                {m.role} · Fiabilité {m.score}%
              </Text>
            </View>
            {m.status === "En attente" ? (
              <TouchableOpacity
                onPress={() => approveMember(m.id)}
                style={[styles.badgeBtn, { backgroundColor: colors.secondary }]}
              >
                <Text style={styles.badgeBtnText}>Valider</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => showAlert(m.name, `Téléphone : ${m.phone}\nRôle : ${m.role}`)}
                style={[styles.badgeBtn, { backgroundColor: colors.primary + "12" }]}
              >
                <Text style={[styles.badgeBtnText, { color: colors.primary }]}>Contacter</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
      <View style={{ height: 80 }} />
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
  searchWrap: { padding: SPACING.lg, paddingBottom: SPACING.sm },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
  },
  list: { paddingHorizontal: SPACING.lg },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  avatarText: { fontSize: 18, fontWeight: "900" },
  name: { fontSize: 15, fontWeight: "800" },
  meta: { fontSize: 12, marginTop: 2 },
  badgeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  badgeBtnText: { color: "#fff", fontSize: 12, fontWeight: "800" },
});
