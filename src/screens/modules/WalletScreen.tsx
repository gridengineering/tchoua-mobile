import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import { COLORS, SPACING, SHADOW } from "../../theme";
import { showAlert } from "../../utils/feedback";

const INITIAL_TRANSACTIONS = [
  { id: "1", type: "deposit", amount: "+ 50 000 FCFA", date: "Aujourd'hui, 10:30", label: "Rechargement Orange Money" },
  { id: "2", type: "payment", amount: "- 15 000 FCFA", date: "Hier, 14:00", label: "Cotisation Tontine Ndi" },
  { id: "3", type: "receive", amount: "+ 100 000 FCFA", date: "05 Mai 2026", label: "Aide Solidarité (Naissance)" },
  { id: "4", type: "withdraw", amount: "- 20 000 FCFA", date: "01 Mai 2026", label: "Retrait MTN MoMo" },
];

export const WalletScreen = ({ navigation }: any) => {
  const [balance, setBalance] = useState(115000);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [modalMode, setModalMode] = useState<"deposit" | "withdraw" | "transfer" | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [noteInput, setNoteInput] = useState("");

  const handleConfirm = () => {
    const amt = Number(amountInput.replace(/\s+/g, ""));
    if (!amt || amt <= 0) {
      showAlert("Montant invalide", "Veuillez saisir un montant valide.");
      return;
    }
    if (modalMode !== "deposit" && amt > balance) {
      showAlert("Solde insuffisant", "Votre solde disponible est insuffisant pour cette opération.");
      return;
    }
    const nextBalance = modalMode === "deposit" ? balance + amt : balance - amt;
    const prefix = modalMode === "deposit" ? "+" : "-";
    const label =
      modalMode === "deposit"
        ? noteInput.trim() || "Rechargement Mobile Money"
        : modalMode === "withdraw"
          ? noteInput.trim() || "Retrait Mobile Money"
          : noteInput.trim() || "Transfert vers membre";
    setBalance(nextBalance);
    setTransactions((prev) => [
      {
        id: String(Date.now()),
        type: modalMode === "deposit" ? "deposit" : modalMode === "withdraw" ? "withdraw" : "payment",
        amount: `${prefix} ${amt.toLocaleString("fr-FR")} FCFA`,
        date: "À l'instant",
        label,
      },
      ...prev,
    ]);
    setAmountInput("");
    setNoteInput("");
    setModalMode(null);
    showAlert("Opération effectuée", `Nouveau solde : ${nextBalance.toLocaleString("fr-FR")} FCFA.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Portefeuille</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Solde Disponible</Text>
          <Text style={styles.balanceAmount}>{balance.toLocaleString("fr-FR")} FCFA</Text>
          
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setModalMode("deposit")}>
              <Text style={styles.actionIcon}>⬇️</Text>
              <Text style={styles.actionText}>Recharger</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionBtn} onPress={() => setModalMode("withdraw")}>
              <Text style={styles.actionIcon}>⬆️</Text>
              <Text style={styles.actionText}>Retirer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => setModalMode("transfer")}>
              <Text style={styles.actionIcon}>🔄</Text>
              <Text style={styles.actionText}>Transférer</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transactions Récentes</Text>
          {transactions.map(tx => (
            <View key={tx.id} style={styles.txItem}>
              <View style={styles.txIconContainer}>
                <Text style={styles.txIcon}>
                  {tx.type === "deposit" ? "⬇️" : tx.type === "payment" ? "📤" : tx.type === "receive" ? "📥" : "⬆️"}
                </Text>
              </View>
              <View style={styles.txDetails}>
                <Text style={styles.txLabel}>{tx.label}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.amount.startsWith("+") ? COLORS.success : COLORS.danger }]}>
                {tx.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={Boolean(modalMode)} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: SPACING.lg }}>
          <View style={{ backgroundColor: COLORS.white, borderRadius: 20, padding: SPACING.lg }}>
            <Text style={{ fontSize: 18, fontWeight: "900", color: COLORS.primary, marginBottom: SPACING.md }}>
              {modalMode === "deposit" ? "Recharger le portefeuille" : modalMode === "withdraw" ? "Retirer des fonds" : "Transférer à un membre"}
            </Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 12, padding: 12, marginBottom: SPACING.sm }}
              placeholder="Montant (FCFA)"
              keyboardType="numeric"
              value={amountInput}
              onChangeText={setAmountInput}
            />
            <TextInput
              style={{ borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 12, padding: 12, marginBottom: SPACING.md }}
              placeholder={modalMode === "transfer" ? "Destinataire" : "Opérateur / Motif (optionnel)"}
              value={noteInput}
              onChangeText={setNoteInput}
            />
            <View style={{ flexDirection: "row", gap: SPACING.sm }}>
              <TouchableOpacity
                onPress={() => setModalMode(null)}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: COLORS.lightGray, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "700", color: COLORS.black }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "800", color: COLORS.white }}>Valider</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    ...SHADOW.sm,
  },
  backBtn: { padding: SPACING.sm },
  backText: { color: COLORS.primary, fontWeight: "bold" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.black },
  content: { padding: SPACING.md },
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: "center",
    ...SHADOW.md,
    marginBottom: SPACING.lg,
  },
  balanceLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "bold", textTransform: "uppercase" },
  balanceAmount: { color: COLORS.white, fontSize: 36, fontWeight: "900", marginVertical: SPACING.sm },
  actionRow: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginTop: SPACING.lg },
  actionBtn: { alignItems: "center" },
  actionIcon: { fontSize: 24, marginBottom: SPACING.xs, backgroundColor: "rgba(255,255,255,0.2)", padding: SPACING.sm, borderRadius: 16, overflow: "hidden" },
  actionText: { color: COLORS.white, fontSize: 12, fontWeight: "bold" },
  section: { backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.md, ...SHADOW.sm },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.black, marginBottom: SPACING.md },
  txItem: { flexDirection: "row", alignItems: "center", paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  txIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.background, justifyContent: "center", alignItems: "center", marginRight: SPACING.md },
  txIcon: { fontSize: 20 },
  txDetails: { flex: 1 },
  txLabel: { fontSize: 14, fontWeight: "600", color: COLORS.black },
  txDate: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: "bold" },
});
