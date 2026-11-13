import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
} from "react-native";
import { COLORS, SPACING, SHADOW } from "../../theme";
import { showAlert } from "../../utils/feedback";

const { width } = Dimensions.get("window");

const INITIAL_LOANS = [
  { id: "1", label: "Prêt Scolaire", amountNum: 200000, remainingNum: 85000, nextDate: "15 Mai", status: "En cours", color: COLORS.success },
  { id: "2", label: "Besoin Fond de Roulement", amountNum: 500000, remainingNum: 500000, nextDate: "Juin 2026", status: "Accordé", color: COLORS.info },
];

export const PretsScreen = ({ navigation, route }: any) => {
  const [loans, setLoans] = useState(INITIAL_LOANS);
  const [payTarget, setPayTarget] = useState<(typeof INITIAL_LOANS)[0] | null>(null);
  const [payAmount, setPayAmount] = useState("25000");
  const [reqModal, setReqModal] = useState(false);
  const [reqLabel, setReqLabel] = useState("");
  const [reqAmount, setReqAmount] = useState("");
  const [reqDuration, setReqDuration] = useState("6 mois");

  useEffect(() => {
    if (route?.params?.openLoanModal) {
      setReqModal(true);
    }
  }, [route?.params?.openLoanModal]);

  const totalRemaining = loans.reduce((s, l) => s + l.remainingNum, 0);

  const confirmRepayment = () => {
    if (!payTarget) return;
    const amt = Number(payAmount.replace(/\s+/g, ""));
    if (!amt || amt <= 0) {
      showAlert("Montant invalide", "Veuillez saisir un montant valide.");
      return;
    }
    const interest = Math.round(amt * 0.05);
    const principal = Math.max(0, amt - interest);
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id !== payTarget.id) return l;
        const nextRem = Math.max(0, l.remainingNum - principal);
        return {
          ...l,
          remainingNum: nextRem,
          status: nextRem === 0 ? "Remboursé" : l.status,
        };
      })
    );
    setPayTarget(null);
    showAlert(
      "Remboursement enregistré",
      `Versement : ${amt.toLocaleString("fr-FR")} F\n• Principal : ${principal.toLocaleString("fr-FR")} F\n• Intérêts : ${interest.toLocaleString("fr-FR")} F`
    );
  };

  const submitRequest = () => {
    const amt = Number(reqAmount.replace(/\s+/g, ""));
    if (!reqLabel.trim() || !amt || amt <= 0) {
      showAlert("Champs requis", "Veuillez renseigner l'objet et le montant du prêt.");
      return;
    }
    setLoans((prev) => [
      {
        id: String(Date.now()),
        label: reqLabel.trim(),
        amountNum: amt,
        remainingNum: amt,
        nextDate: reqDuration.trim() || "6 mois",
        status: "Demandé",
        color: COLORS.warning,
      },
      ...prev,
    ]);
    setReqLabel("");
    setReqAmount("");
    setReqModal(false);
    showAlert("Demande envoyée", "Votre demande de prêt a été soumise au bureau.");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Prêts & Crédit</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Encours Total</Text>
          <Text style={styles.summaryValue}>{totalRemaining.toLocaleString("fr-FR")} F</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: COLORS.secondary + "15" }]}>
          <Text style={[styles.summaryLabel, { color: COLORS.secondary }]}>Capacité Prêt</Text>
          <Text style={[styles.summaryValue, { color: COLORS.secondary }]}>1.2M F</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes Prêts</Text>
        {loans.map((loan) => {
          const pct = loan.amountNum > 0 ? Math.round(((loan.amountNum - loan.remainingNum) / loan.amountNum) * 100) : 0;
          return (
            <View key={loan.id} style={styles.loanItem}>
              <View style={styles.loanHeader}>
                <Text style={styles.loanLabel}>{loan.label}</Text>
                <View style={[styles.statusBadge, { backgroundColor: loan.color + "15" }]}>
                  <Text style={[styles.statusText, { color: loan.color }]}>{loan.status}</Text>
                </View>
              </View>
              
              <View style={styles.loanBody}>
                <View>
                  <Text style={styles.metaLabel}>Montant Initial</Text>
                  <Text style={styles.metaValue}>{loan.amountNum.toLocaleString("fr-FR")} F</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.metaLabel}>Reste à payer</Text>
                  <Text style={[styles.metaValue, { color: COLORS.danger }]}>{loan.remainingNum.toLocaleString("fr-FR")} F</Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: loan.color }]} />
              </View>

              <View style={styles.loanFooter}>
                <Text style={styles.nextDate}>Échéance : {loan.nextDate}</Text>
                {loan.remainingNum > 0 && (
                  <TouchableOpacity
                    style={styles.payNowBtn}
                    onPress={() => {
                      setPayTarget(loan);
                      setPayAmount(String(Math.min(50000, loan.remainingNum)));
                    }}
                  >
                    <Text style={styles.payNowText}>PAYER</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <TouchableOpacity style={styles.requestBtn} onPress={() => setReqModal(true)}>
        <Text style={styles.requestBtnIcon}>💳</Text>
        <Text style={styles.requestBtnText}>DEMANDER UN PRÊT</Text>
      </TouchableOpacity>

      <Modal visible={Boolean(payTarget)} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: SPACING.lg }}>
          <View style={{ backgroundColor: COLORS.white, borderRadius: 20, padding: SPACING.lg }}>
            <Text style={{ fontSize: 18, fontWeight: "900", color: COLORS.primary, marginBottom: 4 }}>
              Rembourser un prêt
            </Text>
            <Text style={{ fontSize: 13, color: COLORS.gray, marginBottom: SPACING.md }}>
              {payTarget?.label} · Reste : {payTarget?.remainingNum.toLocaleString("fr-FR")} F
            </Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 12, padding: 12, marginBottom: SPACING.md }}
              placeholder="Montant (FCFA)"
              keyboardType="numeric"
              value={payAmount}
              onChangeText={setPayAmount}
            />
            <View style={{ flexDirection: "row", gap: SPACING.sm }}>
              <TouchableOpacity
                onPress={() => setPayTarget(null)}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: COLORS.lightGray, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "700", color: COLORS.black }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmRepayment}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "800", color: COLORS.white }}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={reqModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: SPACING.lg }}>
          <View style={{ backgroundColor: COLORS.white, borderRadius: 20, padding: SPACING.lg }}>
            <Text style={{ fontSize: 18, fontWeight: "900", color: COLORS.primary, marginBottom: SPACING.md }}>
              Solliciter un prêt
            </Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 12, padding: 12, marginBottom: SPACING.sm }}
              placeholder="Objet du prêt (ex: Équipement)"
              value={reqLabel}
              onChangeText={setReqLabel}
            />
            <TextInput
              style={{ borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 12, padding: 12, marginBottom: SPACING.sm }}
              placeholder="Montant souhaité (FCFA)"
              keyboardType="numeric"
              value={reqAmount}
              onChangeText={setReqAmount}
            />
            <TextInput
              style={{ borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 12, padding: 12, marginBottom: SPACING.md }}
              placeholder="Durée (ex: 6 mois)"
              value={reqDuration}
              onChangeText={setReqDuration}
            />
            <View style={{ flexDirection: "row", gap: SPACING.sm }}>
              <TouchableOpacity
                onPress={() => setReqModal(false)}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: COLORS.lightGray, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "700", color: COLORS.black }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submitRequest}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: COLORS.secondary, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "800", color: COLORS.white }}>Soumettre</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: SPACING.md,
  },
  backText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.primary,
  },
  summaryRow: {
    flexDirection: "row",
    padding: SPACING.lg,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 20,
    ...SHADOW.sm,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
  },
  section: {
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  loanItem: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  loanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  loanLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.black,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  loanBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  metaLabel: {
    fontSize: 10,
    color: COLORS.gray,
    fontWeight: "600",
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.black,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: SPACING.md,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  loanFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextDate: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: "600",
  },
  payNowBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  payNowText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
  },
  requestBtn: {
    margin: SPACING.lg,
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    ...SHADOW.md,
  },
  requestBtnIcon: {
    fontSize: 20,
    color: COLORS.white,
  },
  requestBtnText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: 1,
  },
});
