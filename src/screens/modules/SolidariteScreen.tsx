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
import { COLORS, SHADOW, SPACING } from "../../theme";
import { showAlert } from "../../utils/feedback";

const CATEGORIES = [
  { label: "Décès", value: "DEATH_MEMBER", icon: "🕊️" },
  { label: "Naissance", value: "BIRTH", icon: "👶" },
  { label: "Mariage", value: "MARRIAGE", icon: "💒" },
  { label: "Maladie", value: "ILLNESS_MEMBER", icon: "🏥" },
];

export const SolidariteScreen = ({ navigation, route }: any) => {
  const [assocId, setAssocId] = useState<string | null>(null);
  const [aidModal, setAidModal] = useState(false);
  const [category, setCategory] = useState("BIRTH");
  const [amount, setAmount] = useState("50000");
  const [reason, setReason] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (route?.params?.openAidModal) {
      setAidModal(true);
    }
  }, [route?.params?.openAidModal]);

  const loadRequests = useCallback(async () => {
    try {
      const selectedId = await getSelectedAssociation();
      if (!selectedId) {
        setRequests([]);
        return;
      }
      setAssocId(selectedId);
      const res = await apiGet<{ requests?: any[] }>(`/associations/${selectedId}/social-aids`);
      setRequests(res.requests ?? []);
    } catch {
      // Keep cached
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const submitAid = async () => {
    const amt = Number(amount.replace(/\s+/g, ""));
    if (!assocId || !amt || amt <= 0) {
      showAlert("Données requises", "Veuillez sélectionner une association et saisir un montant valide.");
      return;
    }
    try {
      await apiPost(`/associations/${assocId}/social-aids`, {
        category,
        requestedAmount: amt,
        justification: reason.trim() || "Demande soumise via Tchoua Mobile",
      });
      setReason("");
      setAidModal(false);
      showAlert("Demande enregistrée", "Votre demande d'aide sociale a été transmise au bureau.");
      loadRequests();
    } catch (err: any) {
      showAlert("Erreur", err?.message || "Impossible de soumettre la demande.");
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
            loadRequests();
          }}
        />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Fonds de Solidarité</Text>
      </View>

      <View style={styles.grid}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.value}
            style={styles.caisseCard}
            onPress={() => {
              setCategory(c.value);
              setAidModal(true);
            }}
          >
            <Text style={{ fontSize: 28 }}>{c.icon}</Text>
            <Text style={styles.caisseTitle}>{c.label}</Text>
            <Text style={styles.caisseSub}>Demander une aide ›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demandes ({requests.length})</Text>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : requests.length === 0 ? (
          <Text style={styles.empty}>Aucune demande d'aide enregistrée.</Text>
        ) : (
          requests.map((r) => (
            <View key={r.id} style={styles.reqCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.reqTitle}>
                  🤝 {r.category} · {Number(r.requestedAmount || 0).toLocaleString("fr-FR")} F
                </Text>
                <Text style={styles.reqMeta}>
                  {r.membership?.user?.name || "Membre"} · {r.justification || "Sans motif"}
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{r.status}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <Modal visible={aidModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nouvelle demande d'aide ({category})</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="Montant demandé (FCFA)"
            />
            <TextInput
              style={styles.input}
              value={reason}
              onChangeText={setReason}
              placeholder="Justification / Détails"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setAidModal(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitAid} style={styles.confirmBtn}>
                <Text style={styles.confirmText}>Envoyer</Text>
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
  grid: { flexDirection: "row", flexWrap: "wrap", padding: SPACING.lg, gap: SPACING.sm },
  caisseCard: {
    width: "48%",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  caisseTitle: { fontSize: 15, fontWeight: "800", color: COLORS.text, marginTop: 6 },
  caisseSub: { fontSize: 12, color: COLORS.primary, fontWeight: "700", marginTop: 4 },
  section: { paddingHorizontal: SPACING.lg },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: COLORS.text, marginBottom: SPACING.sm },
  empty: { textAlign: "center", color: COLORS.gray, marginTop: 20 },
  reqCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  reqTitle: { fontSize: 14, fontWeight: "800", color: COLORS.text },
  reqMeta: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  badge: {
    backgroundColor: COLORS.secondary + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 11, fontWeight: "800", color: COLORS.secondary },
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
