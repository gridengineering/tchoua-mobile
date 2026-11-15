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
import { apiGet, apiPost } from "../../api/client";
import { COLORS, SHADOW, SPACING } from "../../theme";
import { showAlert } from "../../utils/feedback";

export const EpargneScreen = ({ navigation }: any) => {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("");

  const loadGoals = useCallback(async () => {
    try {
      const res = await apiGet<any[]>("/savings");
      setGoals(Array.isArray(res) ? res : []);
    } catch {
      // Keep cached
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const totalBalance = goals.reduce((s, g) => s + Number(g.currentAmount || 0), 0);

  const handleDeposit = async () => {
    const amt = Number(amountInput.replace(/\s+/g, ""));
    if (!selectedId || !amt || amt <= 0) {
      showAlert("Montant invalide", "Veuillez saisir un montant valide.");
      return;
    }
    try {
      await apiPost(`/savings/${selectedId}/contribute`, { amount: amt });
      setSelectedId(null);
      setAmountInput("");
      showAlert("Épargne créditée", `${amt.toLocaleString("fr-FR")} F ajoutés à votre objectif.`);
      loadGoals();
    } catch (err: any) {
      showAlert("Erreur", err?.message || "Impossible de créditer l'objectif.");
    }
  };

  const handleCreateGoal = async () => {
    const target = Number(newTarget.replace(/\s+/g, ""));
    if (!newName.trim() || !target || target <= 0) {
      showAlert("Champs requis", "Veuillez renseigner un nom et un objectif valide.");
      return;
    }
    try {
      await apiPost("/savings", { name: newName.trim(), targetAmount: target });
      setCreateModal(false);
      setNewName("");
      setNewTarget("");
      loadGoals();
    } catch (err: any) {
      showAlert("Erreur", err?.message || "Impossible de créer l'objectif.");
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
            loadGoals();
          }}
        />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Épargne & Projets</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Épargné</Text>
        <Text style={styles.summaryVal}>{totalBalance.toLocaleString("fr-FR")} FCFA</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setCreateModal(true)}>
          <Text style={styles.addBtnText}>+ Nouvel objectif</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes Objectifs ({goals.length})</Text>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : goals.length === 0 ? (
          <Text style={styles.empty}>Aucun objectif d'épargne enregistré.</Text>
        ) : (
          goals.map((g) => (
            <View key={g.id} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>
                  {g.icon || "💰"} {g.name}
                </Text>
                <Text style={styles.cardSub}>
                  {Number(g.currentAmount || 0).toLocaleString("fr-FR")} F /{" "}
                  {Number(g.targetAmount || 0).toLocaleString("fr-FR")} F
                </Text>
              </View>
              <TouchableOpacity
                style={styles.depositBtn}
                onPress={() => setSelectedId(g.id)}
              >
                <Text style={styles.depositBtnText}>+ Verser</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <Modal visible={Boolean(selectedId)} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Verser sur l'objectif</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={amountInput}
              onChangeText={setAmountInput}
              placeholder="Montant (FCFA)"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setSelectedId(null)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeposit} style={styles.confirmBtn}>
                <Text style={styles.confirmText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={createModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nouvel objectif d'épargne</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Nom du projet"
            />
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={newTarget}
              onChangeText={setNewTarget}
              placeholder="Montant cible (FCFA)"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setCreateModal(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateGoal} style={styles.confirmBtn}>
                <Text style={styles.confirmText}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  summaryCard: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    ...SHADOW.md,
  },
  summaryLabel: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: "700" },
  summaryVal: { color: "#fff", fontSize: 26, fontWeight: "900", marginTop: 4 },
  addBtn: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.secondary,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  section: { paddingHorizontal: SPACING.lg },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: COLORS.text, marginBottom: SPACING.sm },
  empty: { textAlign: "center", color: COLORS.gray, marginTop: 20 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  cardTitle: { fontSize: 15, fontWeight: "800", color: COLORS.text },
  cardSub: { fontSize: 12, color: COLORS.gray, marginTop: 3 },
  depositBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  depositBtnText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: SPACING.lg,
  },
  modalCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: SPACING.lg },
  modalTitle: { fontSize: 16, fontWeight: "900", color: COLORS.text, marginBottom: SPACING.md },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: SPACING.sm,
    fontSize: 14,
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: SPACING.sm },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  cancelText: { color: COLORS.gray, fontWeight: "700" },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  confirmText: { color: "#fff", fontWeight: "800" },
});
