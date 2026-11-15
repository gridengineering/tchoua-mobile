import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiGet, apiPatch, getSelectedAssociation } from "../../api/client";
import { useTheme } from "../../context/ThemeContext";
import { SHADOW, SPACING } from "../../theme";
import { showAlert } from "../../utils/feedback";

type MemberItem = {
  id: string;
  name: string;
  role: string;
  score: number;
  status: string;
  phone: string;
};

export const MembresScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [assocId, setAssocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMembers = useCallback(async () => {
    try {
      const selectedId = await getSelectedAssociation();
      if (!selectedId) {
        setMembers([]);
        return;
      }
      setAssocId(selectedId);
      const res = await apiGet<{ members: any[] }>(`/associations/${selectedId}/members`);
      const mapped: MemberItem[] = (res.members ?? []).map((m) => ({
        id: m.id,
        name: m.user?.name || m.user?.email || "Membre",
        role: m.customRole?.name || m.role || "MEMBER",
        score: Math.round(m.reliabilityScore ?? 100),
        status: m.status === "PENDING" ? "En attente" : m.status === "ACTIVE" ? "Actif" : m.status,
        phone: m.user?.phone || "Non renseigné",
      }));
      setMembers(mapped);
    } catch {
      // Keep cached/empty list silently on offline error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.role.toLowerCase().includes(query.toLowerCase())
  );

  const approveMember = async (id: string) => {
    if (!assocId) return;
    try {
      await apiPatch(`/associations/${assocId}/members/${id}`, { status: "ACTIVE" });
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status: "Actif" } : m)));
      showAlert("Membre validé", "Le membre est maintenant actif dans l'association.");
    } catch (err: any) {
      showAlert("Erreur", err?.message || "Impossible de valider ce membre.");
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
            loadMembers();
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

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />
      ) : filtered.length === 0 ? (
        <Text style={[styles.empty, { color: colors.gray }]}>
          Aucun membre trouvé pour cette association.
        </Text>
      ) : (
        <View style={styles.list}>
          {filtered.map((m) => (
            <View key={m.id} style={[styles.card, { backgroundColor: colors.surface }]}>
              <View style={[styles.avatar, { backgroundColor: colors.primary + "15" }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>
                  {m.name.charAt(0).toUpperCase()}
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
      )}
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
  empty: { textAlign: "center", marginTop: 32, fontSize: 14 },
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
