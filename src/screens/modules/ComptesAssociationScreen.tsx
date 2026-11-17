import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { apiGet, apiOnline, getSelectedAssociation, uploadAssociationProof } from "../../api/client";
import { useTheme } from "../../context/ThemeContext";
import { SPACING } from "../../theme";

type Tx = { id: string; type: string; method: string; direction: string; amount: number; balanceAfter: number; status: string; createdAt: string; activity?: { name: string } | null };
type Activity = { id: string; name: string; caisseBalance: number };

export const ComptesAssociationScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [associationId, setAssociationId] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [method, setMethod] = useState("WALLET");
  const [amount, setAmount] = useState("");
  const [bankId, setBankId] = useState("");
  const [proof, setProof] = useState<string | null>(null);
  const [proofName, setProofName] = useState("");
  const [settleActivity, setSettleActivity] = useState("");
  const [settleAmount, setSettleAmount] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const id = await getSelectedAssociation();
    setAssociationId(id);
    if (!id) { setLoading(false); return; }
    setRefreshing(true);
    try {
      const result = await apiGet<any>(`/associations/${id}/member-account`);
      setData(result);
      const bank = result.bankAccounts?.find((b: any) => b.isDefault) ?? result.bankAccounts?.[0];
      if (bank) setBankId((old) => old || bank.id);
    } catch (e: any) {
      setMessage(e?.message ?? "Compte indisponible");
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const pickProof = async () => {
    const picked = await DocumentPicker.getDocumentAsync({ type: ["image/*", "application/pdf"], copyToCacheDirectory: true });
    if (picked.canceled || !picked.assets?.[0]) return;
    const asset = picked.assets[0];
    if (!associationId) return;
    setSaving(true); setMessage("");
    try {
      const uploaded = await uploadAssociationProof(associationId, { uri: asset.uri, name: asset.name, type: asset.mimeType || "image/jpeg" });
      setProof(uploaded.url); setProofName(asset.name);
    } catch (e: any) { setMessage(e?.message ?? "Preuve non envoyée"); } finally { setSaving(false); }
  };

  const submit = async () => {
    if (!associationId) return;
    const value = Number(amount);
    if (!value || value <= 0) { setMessage("Montant invalide"); return; }
    setSaving(true); setMessage("");
    try {
      const action = method === "WALLET" ? "DEPOSIT_WALLET" : method === "BANK" ? "DEPOSIT_BANK" : "DEPOSIT_CASH";
      if (method === "BANK" && !proof) throw new Error("Joignez la preuve du virement.");
      const result = await apiOnline<any>(`/associations/${associationId}/member-account`, {
        action, amount: value,
        ...(method === "BANK" ? { bankAccountId: bankId, proofUrl: proof } : {}),
      }, "POST", { "Idempotency-Key": `mobile-${Date.now()}-${Math.random().toString(36).slice(2)}` } as any);
      setMessage(result?.pending ? "Versement en attente de rapprochement." : "Versement enregistré.");
      setAmount(""); setProof(null); setProofName("");
      await load();
    } catch (e: any) { setMessage(e?.message ?? "Versement impossible"); } finally { setSaving(false); }
  };

  if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (!associationId) return <View style={[styles.center, { backgroundColor: colors.background }]}><Text style={{ color: colors.text }}>Sélectionnez une association.</Text></View>;

  const currency = data?.association?.currency ?? "XAF";
  const canManage = Boolean(data?.canManage);
  const cash = data?.association?.cash ?? { enabled: true, max: 0 };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />} contentContainerStyle={{ padding: SPACING.md, paddingBottom: 80 }}>
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <Text style={styles.eyebrow}>AVOIR AUPRÈS DE L’ASSOCIATION</Text>
        <Text style={styles.balance}>{Number(data?.account?.balance ?? 0).toLocaleString("fr-FR")} {currency}</Text>
        <Text style={styles.sub}>Wallet membre : {Number(data?.wallet?.balance ?? 0).toLocaleString("fr-FR")} {currency}</Text>
        <Text style={styles.sub}>{data?.association?.name}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Approvisionner mon compte</Text>
        <View style={styles.methods}>
          {[["WALLET", "Mon Wallet"], ["BANK", "Banque"], ["CASH", "Espèces"]].map(([value, label]) => (
            <TouchableOpacity key={value} onPress={() => setMethod(value)} style={[styles.method, { backgroundColor: method === value ? colors.primary : colors.background }]}>
              <Text style={{ color: method === value ? "#fff" : colors.text, fontSize: 12, fontWeight: "800" }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="Montant" placeholderTextColor={colors.gray} style={[styles.input, { color: colors.text, backgroundColor: colors.background }]} />
        {method === "BANK" && <>
          <Text style={[styles.label, { color: colors.gray }]}>Compte bancaire de l’association</Text>
          {(data?.bankAccounts ?? []).map((b: any) => (
            <TouchableOpacity key={b.id} onPress={() => setBankId(b.id)} style={[styles.bank, { borderColor: bankId === b.id ? colors.primary : colors.lightGray }]}>
              <Text style={{ color: colors.text, fontSize: 12, fontWeight: "700" }}>{b.label}</Text>
              <Text style={{ color: colors.gray, fontSize: 11 }}>{b.bankName} · {b.accountNumber}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={pickProof} style={[styles.proof, { borderColor: colors.lightGray }]}>
            <Text style={{ color: colors.text, fontSize: 12, fontWeight: "700" }}>{proofName ? `📎 ${proofName}` : "📎 Joindre la preuve (photo ou PDF)"}</Text>
          </TouchableOpacity>
        </>}
        {method === "CASH" && <Text style={{ color: cash.enabled ? "#8a6410" : "#b91c1c", fontSize: 12, marginBottom: 8 }}>{cash.enabled ? `Espèces autorisées${cash.max ? ` · plafond ${Number(cash.max).toLocaleString("fr-FR")} ${currency}` : ""}. Encaissement par un membre du bureau.` : "Espèces désactivées pour cette association."}</Text>}
        <TouchableOpacity onPress={submit} disabled={saving || (method === "CASH" && !canManage)} style={[styles.submit, { backgroundColor: colors.primary, opacity: saving || (method === "CASH" && !canManage) ? 0.5 : 1 }]}>
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 13 }}>{saving ? "Enregistrement…" : "Enregistrer le versement"}</Text>
        </TouchableOpacity>
        {!!message && <Text style={{ color: colors.secondary, fontSize: 12, fontWeight: "700", marginTop: 8 }}>{message}</Text>}
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Régler une activité</Text>
        <Text style={{ color: colors.gray, fontSize: 12, marginBottom: 8 }}>Utilisez votre AVOIR pour régler une cotisation, un remboursement ou une activité.</Text>
        {(data?.activities ?? []).map((a: Activity) => (
          <TouchableOpacity key={a.id} onPress={() => setSettleActivity(a.id)} style={[styles.bank, { borderColor: settleActivity === a.id ? colors.primary : colors.lightGray }]}>
            <Text style={{ color: colors.text, fontSize: 12, fontWeight: "700" }}>{a.name}</Text>
            <Text style={{ color: colors.gray, fontSize: 11 }}>Solde activité : {Number(a.caisseBalance).toLocaleString("fr-FR")} {currency}</Text>
          </TouchableOpacity>
        ))}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput value={settleAmount} onChangeText={setSettleAmount} keyboardType="numeric" placeholder="Montant" placeholderTextColor={colors.gray} style={[styles.input, { flex: 1, color: colors.text, backgroundColor: colors.background }]} />
          <TouchableOpacity onPress={async () => { if (!settleActivity || !settleAmount) return; setSaving(true); try { await apiOnline(`/associations/${associationId}/member-account`, { action: "SETTLE", amount: Number(settleAmount), activityId: settleActivity }, "POST", { "Idempotency-Key": `mobile-settle-${Date.now()}` } as any); setMessage("Engagement réglé depuis votre AVOIR."); setSettleAmount(""); await load(); } catch (e: any) { setMessage(e?.message ?? "Règlement impossible"); } finally { setSaving(false); } }} disabled={saving || !settleActivity} style={[styles.submit, { backgroundColor: colors.secondary, paddingHorizontal: 14, opacity: saving || !settleActivity ? 0.5 : 1 }]}>
            <Text style={{ color: colors.primary, fontWeight: "900", fontSize: 12 }}>Régler</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.section, { color: colors.text }]}>Derniers mouvements</Text>
      {(data?.transactions ?? []).slice(0, 20).map((t: Tx) => (
        <View key={t.id} style={[styles.tx, { backgroundColor: colors.surface }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 13, fontWeight: "700" }}>{t.activity?.name ?? t.type}</Text>
            <Text style={{ color: colors.gray, fontSize: 11 }}>{new Date(t.createdAt).toLocaleDateString("fr-FR")} · {t.method} · {t.status}</Text>
          </View>
          <Text style={{ color: t.direction === "IN" ? "#047857" : "#be123c", fontWeight: "900" }}>{t.direction === "IN" ? "+" : "−"}{Number(t.amount).toLocaleString("fr-FR")} {currency}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 }, center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: { borderRadius: 24, padding: 22, marginBottom: 12 },
  eyebrow: { color: "#f5c542", fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  balance: { color: "#fff", fontSize: 32, fontWeight: "900", marginTop: 8 },
  sub: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 5 },
  card: { borderRadius: 18, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: "900", marginBottom: 10 },
  methods: { flexDirection: "row", gap: 6, marginBottom: 10 },
  method: { flex: 1, borderRadius: 10, paddingVertical: 9, alignItems: "center" },
  input: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, marginBottom: 8 },
  label: { fontSize: 11, fontWeight: "700", marginBottom: 5, textTransform: "uppercase" },
  bank: { borderWidth: 1, borderRadius: 10, padding: 9, marginBottom: 5 },
  proof: { borderWidth: 1, borderStyle: "dashed", borderRadius: 10, padding: 10, marginVertical: 5 },
  submit: { borderRadius: 12, paddingVertical: 12, alignItems: "center", marginTop: 4 },
  section: { fontSize: 16, fontWeight: "900", marginVertical: 10 },
  tx: { borderRadius: 12, padding: 12, marginBottom: 7, flexDirection: "row", alignItems: "center", gap: 8 },
});
