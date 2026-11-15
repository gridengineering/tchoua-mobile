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

type LoanItem = {
  id: string;
  label: string;
  amountNum: number;
  remainingNum: number;
  nextDate: string;
  status: string;
  color: string;
};

export const PretsScreen = ({ navigation, route }: any) => {
  const [assocId, setAssocId] = useState<string | null>(null);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [loans, setLoans] = useState<LoanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payTarget, setPayTarget] = useState<LoanItem | null>(null);
  const [payAmount, setPayAmount] = useState("25000");
  const [reqModal, setReqModal] = useState(false);
  const [reqLabel, setReqLabel] = useState("");
  const [reqAmount, setReqAmount] = useState("");
  const [reqDuration, setReqDuration] = useState("6");

  useEffect(() => {
    if (route?.params?.openLoanModal) {
      setReqModal(true);
    }
  }, [route?.params?.openLoanModal]);

  const loadLoans = useCallback(async () => {
    try {
      const selectedId = await getSelectedAssociation();
      if (!selectedId) {
        setLoans([]);
        return;
      }
      setAssocId(selectedId);
      const [loansRes, actRes] = await Promise.all([
        apiGet<{ loans?: any[] }>(`/associations/${selectedId}/loans`).catch(() => ({ loans: [] })),
        apiGet<{ activities?: any[] }>(`/associations/${selectedId}/activities`).catch(() => ({ activities: [] })),
      ]);

      const creditAct = (actRes.activities ?? []).find((a) =>
        ["PRET", "INVESTISSEMENT", "EPARGNE"].includes(String(a.type))
      );
      if (creditAct) setActivityId(creditAct.id);

      const mapped: LoanItem[] = (loansRes.loans ?? []).map((l) => {
        const repaid = (l.repayments ?? []).reduce((s: number, r: any) => s + Number(r.amount || 0), 0);
        const rem = Math.max(0, Number(l.totalDue ?? l.amount) - repaid);
        return {
          id: l.id,
          label: l.purpose || l.activity?.name || "Prêt associatif",
          amountNum: Number(l.amount || 0),
          remainingNum: rem,
          nextDate: l.dueDate
            ? new Date(l.dueDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
            : "À définir",
          status: l.status,
          color: l.status === "ACTIVE" ? COLORS.success : l.status === "REPAID" ? COLORS.gray : COLORS.info,
        };
      });
      setLoans(mapped);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  const totalRemaining = loans.reduce((s, l) => s + l.remainingNum, 0);

  const confirmRepayment = async () => {
    if (!payTarget) return;
    const amt = Number(payAmount.replace(/\s+/g, ""));
    if (!amt || amt <= 0) {
      showAlert("Montant invalide", "Veuillez saisir un montant valide.");
      return;
    }
    try {
      await apiPost(`/loans/${payTarget.id}/repayment`, { amount: amt, paymentMethod: "MOBILE_MONEY" });
      setPayTarget(null);
      showAlert("Remboursement enregistré", `${amt.toLocaleString("fr-FR")} F crédités sur le prêt.`);
      loadLoans();
    } catch (err: any) {
      showAlert("Erreur", err?.message || "Impossible d'enregistrer le remboursement.");
    }
  };

  const submitLoanRequest = async () => {
    const amt = Number(reqAmount.replace(/\s+/g, ""));
    const duration = Number(reqDuration) || 6;
    if (!assocId || !activityId || !amt || amt <= 0) {
      showAlert("Données requises", "Sélectionnez une association avec activité de prêt et un montant valide.");
      return;
    }
    try {
      await apiPost(`/associations/${assocId}/loans`, {
        activityId,
        amount: amt,
        duration,
        purpose: reqLabel.trim() || "Demande de prêt mobile",
      });
      setReqModal(false);
      setReqLabel("");
      setReqAmount("");
      showAlert("Demande transmise", "Votre demande de prêt a été enregistrée.");
      loadLoans();
    } catch (err: any) {
      showAlert("Refus / Erreur", err?.message || "Impossible de soumettre la demande de prêt.");
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
            loadLoans();
          }}
        />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Prêts & Crédits</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Encours total restant</Text>
        <Text style={styles.summaryVal}>{totalRemaining.toLocaleString("fr-FR")} FCFA</Text>
        <TouchableOpacity style={styles.reqBtn} onPress={() => setReqModal(true)}>
          <Text style={styles.reqBtnText}>+ Demander un prêt</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes Prêts ({loans.length})</Text>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : loans.length === 0 ? (
          <Text style={styles.empty}>Aucun prêt enregistré pour cette association.</Text>
        ) : (
          loans.map((l) => (
            <View key={l.id} style={styles.loanCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.loanTitle}>{l.label}</Text>
                <Text style={styles.loanMeta}>
                  Initial : {l.amountNum.toLocaleString("fr-FR")} F · Échéance : {l.nextDate}
                </Text>
                <Text style={[styles.loanRem, { color: l.color }]}>
                  Reste : {l.remainingNum.toLocaleString("fr-FR")} F ({l.status})
                </Text>
              </View>
              {l.remainingNum > 0 && (
                <TouchableOpacity
                  style={styles.payBtn}
                  onPress={() => {
                    setPayTarget(l);
                    setPayAmount(String(Math.min(25000, l.remainingNum)));
                  }}
                >
                  <Text style={styles.payBtnText}>Payer</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </View>

      <Modal visible={Boolean(payTarget)} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rembourser : {payTarget?.label}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={payAmount}
              onChangeText={setPayAmount}
              placeholder="Montant (FCFA)"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setPayTarget(null)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmRepayment} style={styles.confirmBtn}>
                <Text style={styles.confirmText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={reqModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nouvelle demande de prêt</Text>
            <TextInput
              style={styles.input}
              value={reqLabel}
              onChangeText={setReqLabel}
              placeholder="Objet du prêt"
            />
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={reqAmount}
              onChangeText={setReqAmount}
              placeholder="Montant (FCFA)"
            />
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={reqDuration}
              onChangeText={setReqDuration}
              placeholder="Durée (mois)"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setReqModal(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitLoanRequest} style={styles.confirmBtn}>
                <Text style={styles.confirmText}>Soumettre</Text>
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
  reqBtn: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.secondary,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
  },
  reqBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  section: { paddingHorizontal: SPACING.lg },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: COLORS.text, marginBottom: SPACING.sm },
  empty: { textAlign: "center", color: COLORS.gray, marginTop: 20 },
  loanCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  loanTitle: { fontSize: 15, fontWeight: "800", color: COLORS.text },
  loanMeta: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  loanRem: { fontSize: 12, fontWeight: "800", marginTop: 4 },
  payBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  payBtnText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.lg,
  },
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
