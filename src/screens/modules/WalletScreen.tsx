import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { COLORS, SPACING, SHADOW } from "../../theme";
import { showAlert } from "../../utils/feedback";
import { apiGet, apiPatch, apiPost } from "../../api/client";

type WalletTx = {
  id: string;
  type: string;
  amount: number;
  fee?: number;
  status?: string;
  description?: string | null;
  reference?: string | null;
  createdAt?: string;
};

type WalletProvider = {
  code: string;
  label: string;
  enabled: boolean;
  min: number;
  max: number;
  requiresKycLevel: number;
};

type KycInfo = {
  level: number;
  status?: string;
  label?: string;
  maxAmountPerTx?: number;
  maxDaily?: number;
  maxMonthly?: number;
};

type NotificationItem = {
  id: string;
  title?: string;
  message?: string;
  read?: boolean;
  createdAt?: string;
};

function formatTxSign(type: string): boolean {
  return ["DEPOSIT", "TRANSFER_IN", "REFUND", "PAYOUT"].includes(type.toUpperCase());
}

function formatTxIcon(type: string): string {
  const upper = type.toUpperCase();
  if (upper === "DEPOSIT") return "⬇️";
  if (upper === "WITHDRAWAL") return "⬆️";
  if (upper === "TRANSFER_IN" || upper === "PAYOUT") return "📥";
  return "📤";
}

function formatDate(iso?: string): string {
  if (!iso) return "Récent";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export const WalletScreen = ({ navigation }: any) => {
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState("FCFA");
  const [kyc, setKyc] = useState<KycInfo | null>(null);
  const [providers, setProviders] = useState<WalletProvider[]>([]);
  const [canDeposit, setCanDeposit] = useState(true);
  const [canWithdraw, setCanWithdraw] = useState(true);
  const [canTransfer, setCanTransfer] = useState(true);
  const [transactions, setTransactions] = useState<WalletTx[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalMode, setModalMode] = useState<"deposit" | "withdraw" | "transfer" | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [receiverInput, setReceiverInput] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("MTN_MOMO");
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadWallet = useCallback(async () => {
    try {
      const [walletRes, notifRes] = await Promise.allSettled([
        apiGet<any>("/wallet"),
        apiGet<any>("/notifications?limit=10"),
      ]);

      if (walletRes.status === "fulfilled" && walletRes.value) {
        const data = walletRes.value;
        const w = data.wallet ?? data;
        setBalance(Number(w?.balance ?? 0));
        setCurrency(w?.currency || "FCFA");
        setTransactions(Array.isArray(w?.transactions) ? w.transactions : []);
        if (data.kyc) setKyc(data.kyc);
        if (Array.isArray(data.providers)) {
          const enabledProviders = data.providers.filter((p: WalletProvider) => p.enabled !== false);
          setProviders(enabledProviders);
          if (enabledProviders.length > 0 && !enabledProviders.some((p: WalletProvider) => p.code === selectedProvider)) {
            setSelectedProvider(enabledProviders[0].code);
          }
        }
        if (typeof data.canDeposit === "boolean") setCanDeposit(data.canDeposit);
        if (typeof data.canWithdraw === "boolean") setCanWithdraw(data.canWithdraw);
        if (typeof data.canTransfer === "boolean") setCanTransfer(data.canTransfer);
      }

      if (notifRes.status === "fulfilled" && Array.isArray(notifRes.value?.notifications)) {
        setNotifications(notifRes.value.notifications);
      }
    } catch {
      // keep existing state if offline
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedProvider]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const openModal = (mode: "deposit" | "withdraw" | "transfer") => {
    if (mode === "deposit" && !canDeposit) {
      showAlert("Opération restreinte", "Votre niveau KYC actuel ne permet pas le dépôt.");
      return;
    }
    if (mode === "withdraw" && !canWithdraw) {
      showAlert("Opération restreinte", "Votre niveau KYC actuel ne permet pas le retrait.");
      return;
    }
    if (mode === "transfer" && !canTransfer) {
      showAlert("Opération restreinte", "Votre niveau KYC actuel ne permet pas le virement.");
      return;
    }
    setOtpRequired(false);
    setOtpInput("");
    setAmountInput("");
    setNoteInput("");
    setReceiverInput("");
    setModalMode(mode);
  };

  const handleRequestOtp = async () => {
    try {
      await apiPost("/wallet/otp", {});
      showAlert("Code envoyé", "Un code de confirmation a été envoyé à votre adresse e-mail.");
    } catch (e: any) {
      showAlert("Erreur OTP", e?.message || "Impossible d'envoyer le code.");
    }
  };

  const handleConfirm = async () => {
    const amt = Number(amountInput.replace(/\s+/g, ""));
    if (!amt || amt <= 0) {
      showAlert("Montant invalide", "Veuillez saisir un montant valide.");
      return;
    }
    if (modalMode !== "deposit" && amt > balance) {
      showAlert("Solde insuffisant", "Vous n'avez pas assez de fonds sur votre compte.");
      return;
    }
    if (modalMode === "transfer" && !receiverInput.trim()) {
      showAlert("Destinataire requis", "Veuillez indiquer l'identifiant du destinataire.");
      return;
    }
    if (!noteInput.trim()) {
      showAlert("Libellé requis", "Veuillez saisir le libellé ou motif de l'opération.");
      return;
    }

    const txType =
      modalMode === "deposit" ? "DEPOSIT" : modalMode === "withdraw" ? "WITHDRAWAL" : "TRANSFER";

    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        type: txType,
        amount: amt,
        description: noteInput.trim(),
      };
      if (txType === "TRANSFER") {
        payload.receiverId = receiverInput.trim();
      } else {
        payload.provider = selectedProvider;
      }
      if (otpRequired && otpInput.trim()) {
        payload.otpCode = otpInput.trim();
      }

      const res = await apiPost<any>("/wallet/transactions", payload);
      if (res?.requiresOTP) {
        setOtpRequired(true);
        showAlert("Confirmation OTP requise", res.message || "Saisissez le code reçu par e-mail.");
        return;
      }

      setModalMode(null);
      setAmountInput("");
      setNoteInput("");
      setReceiverInput("");
      setOtpRequired(false);
      setOtpInput("");
      showAlert("Succès", "Transaction enregistrée sur www.tchoua.com.");
      await loadWallet();
    } catch (e: any) {
      showAlert("Erreur transaction", e?.message || "Impossible d'exécuter l'opération.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    try {
      await apiPatch("/notifications", { ids: unreadIds });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon Portefeuille</Text>
        <TouchableOpacity onPress={loadWallet} style={styles.backBtn}>
          <Text style={styles.backText}>↻</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadWallet();
            }}
          />
        }
      >
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Solde Disponible</Text>
          {loading ? (
            <ActivityIndicator color={COLORS.white} style={{ marginVertical: SPACING.md }} />
          ) : (
            <Text style={styles.balanceAmount}>
              {balance.toLocaleString("fr-FR")} {currency}
            </Text>
          )}
          {kyc && (
            <View style={styles.kycBadge}>
              <Text style={styles.kycText}>
                KYC {kyc.level} · {kyc.label || "Vérifié"}
                {kyc.maxAmountPerTx ? ` · Max ${kyc.maxAmountPerTx.toLocaleString("fr-FR")} ${currency}/tx` : ""}
              </Text>
            </View>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal("deposit")}>
              <Text style={styles.actionIcon}>⬇️</Text>
              <Text style={styles.actionText}>Recharger</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal("withdraw")}>
              <Text style={styles.actionIcon}>⬆️</Text>
              <Text style={styles.actionText}>Retirer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal("transfer")}>
              <Text style={styles.actionIcon}>🔄</Text>
              <Text style={styles.actionText}>Transférer</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transactions Récentes</Text>
          {transactions.length === 0 ? (
            <Text style={styles.emptyText}>Aucune transaction enregistrée.</Text>
          ) : (
            transactions.map((tx) => {
              const isCredit = formatTxSign(tx.type);
              return (
                <View key={tx.id} style={styles.txItem}>
                  <View style={styles.txIconContainer}>
                    <Text style={styles.txIcon}>{formatTxIcon(tx.type)}</Text>
                  </View>
                  <View style={styles.txDetails}>
                    <Text style={styles.txLabel}>{tx.description || tx.type}</Text>
                    <Text style={styles.txDate}>
                      {formatDate(tx.createdAt)} {tx.status ? `· ${tx.status}` : ""}
                    </Text>
                  </View>
                  <Text style={[styles.txAmount, { color: isCredit ? COLORS.success : COLORS.danger }]}>
                    {isCredit ? "+" : "-"} {Number(tx.amount).toLocaleString("fr-FR")} {currency}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        {notifications.length > 0 && (
          <View style={[styles.section, { marginTop: SPACING.md }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.sm }}>
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Alertes & Notifications</Text>
              {notifications.some((n) => !n.read) && (
                <TouchableOpacity onPress={handleMarkAllRead}>
                  <Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: "700" }}>Tout lire</Text>
                </TouchableOpacity>
              )}
            </View>
            {notifications.map((n) => (
              <View key={n.id} style={[styles.txItem, !n.read && { backgroundColor: "rgba(37,99,235,0.05)", borderRadius: 10, paddingHorizontal: 8 }]}>
                <View style={styles.txDetails}>
                  <Text style={styles.txLabel}>{n.title || "Notification"}</Text>
                  {n.message ? <Text style={styles.txDate}>{n.message}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={Boolean(modalMode)} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: SPACING.lg }}>
          <View style={{ backgroundColor: COLORS.white, borderRadius: 20, padding: SPACING.lg }}>
            <Text style={{ fontSize: 18, fontWeight: "900", color: COLORS.primary, marginBottom: SPACING.md }}>
              {modalMode === "deposit" ? "Recharger le portefeuille" : modalMode === "withdraw" ? "Retirer des fonds" : "Transférer à un membre"}
            </Text>

            {modalMode !== "transfer" && providers.length > 0 && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: SPACING.sm }}>
                {providers.map((p) => {
                  const active = selectedProvider === p.code;
                  return (
                    <TouchableOpacity
                      key={p.code}
                      onPress={() => setSelectedProvider(p.code)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 10,
                        backgroundColor: active ? COLORS.primary : COLORS.lightGray,
                      }}
                    >
                      <Text style={{ color: active ? COLORS.white : COLORS.black, fontSize: 12, fontWeight: "700" }}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <TextInput
              style={{ borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 12, padding: 12, marginBottom: SPACING.sm }}
              placeholder={`Montant (${currency})`}
              keyboardType="numeric"
              value={amountInput}
              onChangeText={setAmountInput}
            />
            {modalMode === "transfer" && (
              <TextInput
                style={{ borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 12, padding: 12, marginBottom: SPACING.sm }}
                placeholder="ID ou e-mail du destinataire *"
                value={receiverInput}
                onChangeText={setReceiverInput}
                autoCapitalize="none"
              />
            )}
            <TextInput
              style={{ borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 12, padding: 12, marginBottom: SPACING.sm }}
              placeholder="Libellé ou motif *"
              value={noteInput}
              onChangeText={setNoteInput}
            />

            {otpRequired && (
              <View style={{ marginBottom: SPACING.md }}>
                <TextInput
                  style={{ borderWidth: 1, borderColor: COLORS.primary, borderRadius: 12, padding: 12, marginBottom: 6 }}
                  placeholder="Code OTP reçu par e-mail"
                  keyboardType="numeric"
                  value={otpInput}
                  onChangeText={setOtpInput}
                />
                <TouchableOpacity onPress={handleRequestOtp}>
                  <Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: "700", textAlign: "right" }}>
                    Envoyer / Renvoyer le code OTP
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ flexDirection: "row", gap: SPACING.sm }}>
              <TouchableOpacity
                onPress={() => setModalMode(null)}
                disabled={submitting}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: COLORS.lightGray, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "700", color: COLORS.black }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                disabled={submitting}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "800", color: COLORS.white }}>
                  {submitting ? "Envoi..." : "Valider"}
                </Text>
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
  balanceAmount: { color: COLORS.white, fontSize: 34, fontWeight: "900", marginVertical: SPACING.sm },
  kycBadge: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  kycText: { color: COLORS.white, fontSize: 12, fontWeight: "700" },
  actionRow: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginTop: SPACING.lg },
  actionBtn: { alignItems: "center" },
  actionIcon: { fontSize: 24, marginBottom: SPACING.xs, backgroundColor: "rgba(255,255,255,0.2)", padding: SPACING.sm, borderRadius: 16, overflow: "hidden" },
  actionText: { color: COLORS.white, fontSize: 12, fontWeight: "bold" },
  section: { backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.md, ...SHADOW.sm },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.black, marginBottom: SPACING.md },
  emptyText: { color: COLORS.gray, fontSize: 13, textAlign: "center", paddingVertical: SPACING.md },
  txItem: { flexDirection: "row", alignItems: "center", paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  txIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.background, justifyContent: "center", alignItems: "center", marginRight: SPACING.md },
  txIcon: { fontSize: 20 },
  txDetails: { flex: 1 },
  txLabel: { fontSize: 14, fontWeight: "600", color: COLORS.black },
  txDate: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: "bold" },
});
