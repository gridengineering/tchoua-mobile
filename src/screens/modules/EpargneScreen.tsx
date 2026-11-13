import React, { useState } from "react";
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

export const EpargneScreen = ({ navigation }: any) => {
  const [accounts, setAccounts] = useState([
    { id: "1", label: "Épargne Libre", amount: 85000, trend: "+12%", icon: "💰" },
    { id: "2", label: "Fonds d'Urgence", amount: 150000, trend: "+5%", icon: "🏥" },
    { id: "3", label: "Épargne Projet (Terrain)", amount: 1200000, trend: "+25%", icon: "🏗️" },
  ]);
  const [selectedId, setSelectedId] = useState("1");
  const [modalMode, setModalMode] = useState<"deposit" | "withdraw" | null>(null);
  const [amountInput, setAmountInput] = useState("");

  const totalBalance = accounts.reduce((s, a) => s + a.amount, 0);

  const handleConfirm = () => {
    const amt = Number(amountInput.replace(/\s+/g, ""));
    if (!amt || amt <= 0) {
      showAlert("Montant invalide", "Veuillez saisir un montant valide.");
      return;
    }
    const target = accounts.find((a) => a.id === selectedId);
    if (!target) return;
    if (modalMode === "withdraw" && amt > target.amount) {
      showAlert("Solde insuffisant", `Le compte "${target.label}" ne dispose que de ${target.amount.toLocaleString("fr-FR")} F.`);
      return;
    }
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === selectedId
          ? { ...a, amount: modalMode === "deposit" ? a.amount + amt : a.amount - amt }
          : a
      )
    );
    setAmountInput("");
    setModalMode(null);
    showAlert(
      modalMode === "deposit" ? "Versement effectué" : "Retrait effectué",
      `${amt.toLocaleString("fr-FR")} F ${modalMode === "deposit" ? "ajouté à" : "retiré de"} "${target.label}".`
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Épargne & Invest.</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Solde Total Épargné</Text>
        <Text style={styles.balanceValue}>{totalBalance.toLocaleString("fr-FR")} FCFA</Text>
        <View style={styles.balanceFooter}>
          <View style={styles.trendBadge}>
            <Text style={styles.trendText}>▲ +8.5% ce mois</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes Comptes (touchez pour sélectionner)</Text>
        {accounts.map((acc) => {
          const active = acc.id === selectedId;
          return (
            <TouchableOpacity
              key={acc.id}
              onPress={() => setSelectedId(acc.id)}
              style={[
                styles.accountItem,
                active && { borderWidth: 2, borderColor: COLORS.primary },
              ]}
            >
              <View style={styles.accountIcon}>
                <Text style={{ fontSize: 24 }}>{acc.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.accountLabel}>{acc.label}</Text>
                <Text style={styles.accountTrend}>{acc.trend} d'évolution</Text>
              </View>
              <Text style={styles.accountBalance}>{acc.amount.toLocaleString("fr-FR")} F</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setModalMode("deposit")}>
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionLabelBtn}>Verser</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setModalMode("withdraw")}
          style={[styles.actionButton, { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.primary }]}
        >
          <Text style={[styles.actionIcon, { color: COLORS.primary }]}>💸</Text>
          <Text style={[styles.actionLabelBtn, { color: COLORS.primary }]}>Retirer</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={Boolean(modalMode)} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: SPACING.lg }}>
          <View style={{ backgroundColor: COLORS.white, borderRadius: 20, padding: SPACING.lg }}>
            <Text style={{ fontSize: 18, fontWeight: "900", color: COLORS.primary, marginBottom: SPACING.sm }}>
              {modalMode === "deposit" ? "Verser sur l'épargne" : "Retirer de l'épargne"}
            </Text>
            <Text style={{ fontSize: 13, color: COLORS.gray, marginBottom: SPACING.md }}>
              Compte : {accounts.find((a) => a.id === selectedId)?.label}
            </Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 12, padding: 12, marginBottom: SPACING.md }}
              placeholder="Montant (FCFA)"
              keyboardType="numeric"
              value={amountInput}
              onChangeText={setAmountInput}
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
                <Text style={{ fontWeight: "800", color: COLORS.white }}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Objectifs d'Épargne</Text>
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>Achat Terrain Douala</Text>
            <Text style={styles.goalPercent}>60%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "60%" }]} />
          </View>
          <Text style={styles.goalMeta}>1 200 000 F / 2 000 000 F</Text>
        </View>
      </View>
      
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
  balanceCard: {
    margin: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: 32,
    padding: SPACING.xl,
    alignItems: "center",
    ...SHADOW.md,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  balanceValue: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: "900",
  },
  balanceFooter: {
    marginTop: 16,
  },
  trendBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  trendText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 12,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 20,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  accountLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.black,
  },
  accountTrend: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: "600",
    marginTop: 2,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.primary,
  },
  actionsRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    gap: 12,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionIcon: {
    fontSize: 18,
    color: COLORS.white,
  },
  actionLabelBtn: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 14,
  },
  goalCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: 24,
    ...SHADOW.sm,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.black,
  },
  goalPercent: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.secondary,
  },
  progressBar: {
    height: 10,
    backgroundColor: COLORS.background,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.secondary,
    borderRadius: 5,
  },
  goalMeta: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: "600",
    textAlign: "right",
  },
});
