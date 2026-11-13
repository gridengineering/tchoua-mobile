import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { apiGet, apiPost, getSelectedAssociation } from "../api/client";
import { useTheme } from "../context/ThemeContext";
import { COLORS, SPACING, SHADOW } from "../theme";
import { CYCLE_MODE_LABELS, CycleMode, formatShareFraction } from "../types/association";
import { showAlert } from "../utils/feedback";

interface TontineItem {
  id: string;
  associationId?: string;
  associationName?: string;
  name: string;
  type: string;
  period: string;
  amountNum: number;
  amount: string;
  beneficiaryAmountPerShare: number | null;
  minShareFraction: number;
  maxBeneficiarySharesPerSession: number | null;
  cycleMode: CycleMode;
  progress: number;
  status: string;
  members: number;
  nextDate: string;
}

export const TontinesScreen = ({ navigation, route }: any) => {
  const { colors } = useTheme();
  const [tontines, setTontines] = useState<TontineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [payTarget, setPayTarget] = useState<TontineItem | null>(null);
  const [payFraction, setPayFraction] = useState<number>(1);
  const [payMethod, setPayMethod] = useState<"MOBILE_MONEY" | "CASH" | "BANK">("MOBILE_MONEY");
  const [joinModal, setJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const loadTontines = useCallback(async () => {
    setLoading(true);
    try {
      const assocId = await getSelectedAssociation();
      const query = assocId
        ? `/me/aggregate?resource=activities&type=TONTINE&associationId=${assocId}`
        : "/me/aggregate?resource=activities&type=TONTINE";
      const res = await apiGet<{ items: any[] }>(query);
      if (Array.isArray(res?.items)) {
        const mapped: TontineItem[] = res.items.map((a) => {
          const amt = Number(a.partAmount ?? a.contributionAmount ?? 0);
          const totalSessions = Number(a.cycleSessions ?? a._count?.actSessions ?? 12);
          const held = Number(a._count?.actSessions ?? 0);
          return {
            id: a.id,
            associationId: a.associationId ?? a.association?.id,
            associationName: a.association?.name,
            name: a.name,
            type: a.distributionMode ?? a.type ?? "Tontine",
            period: a.frequency ?? "Mensuel",
            amountNum: amt,
            amount: `${amt.toLocaleString("fr-FR")} F`,
            beneficiaryAmountPerShare: a.beneficiaryAmountPerShare ?? null,
            minShareFraction: Number(a.minShareFraction ?? 1),
            maxBeneficiarySharesPerSession: a.maxBeneficiarySharesPerSession ?? null,
            cycleMode: (a.cycleMode as CycleMode) ?? "FIXED_SESSIONS",
            progress: totalSessions > 0 ? Math.min(1, held / totalSessions) : 0,
            status: a.status ?? "ACTIVE",
            members: Number(a._count?.subscriptions ?? 0),
            nextDate: a.association?.name ?? "En cours",
          };
        });
        setTontines(mapped);
      }
    } catch {
      // keep existing or empty list
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTontines();
  }, [loadTontines]);

  useEffect(() => {
    if (route?.params?.openPayModal && tontines.length > 0) {
      setPayTarget(tontines[0]);
      setPayFraction(1);
    }
  }, [route?.params?.openPayModal, tontines]);

  const confirmPayment = async () => {
    if (!payTarget) return;
    const paidAmount = Math.round(payTarget.amountNum * payFraction);
    const assocId = payTarget.associationId ?? (await getSelectedAssociation());
    if (!assocId) {
      showAlert("Association requise", "Sélectionnez d'abord une association sur l'accueil.");
      return;
    }
    try {
      await apiPost(`/associations/${assocId}/activities/${payTarget.id}/contributions`, {
        amount: paidAmount,
        partsCount: payFraction,
        paymentMethod: payMethod,
      });
      showAlert(
        "Cotisation enregistrée",
        `${paidAmount.toLocaleString("fr-FR")} F (${payFraction} part) enregistré sur www.tchoua.com.`
      );
      loadTontines();
    } catch {
      showAlert(
        "Cotisation mise en file",
        "Votre paiement sera synchronisé avec www.tchoua.com dès que la connexion sera rétablie."
      );
    }
    setPayTarget(null);
  };

  const confirmJoin = async () => {
    if (!joinCode.trim()) {
      showAlert("Code requis", "Saisissez le code d'invitation de l'association sur www.tchoua.com.");
      return;
    }
    try {
      await apiPost("/associations/join", { inviteCode: joinCode.trim() });
      setJoinCode("");
      setJoinModal(false);
      showAlert("Demande envoyée", "Votre demande d'adhésion a été transmise sur www.tchoua.com.");
      loadTontines();
    } catch (err) {
      showAlert("Adhésion", `Impossible de rejoindre : ${(err as Error).message}`);
    }
  };

  const TONTINES = tontines;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadTontines} />}
    >
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.lightGray }]}>
        <Text style={[styles.title, { color: colors.primary }]}>Mes Tontines</Text>
        <Text style={[styles.subtitle, { color: colors.gray }]}>Gérez vos cotisations, parts et cycles</Text>
      </View>

      <View style={styles.list}>
        {loading && TONTINES.length === 0 ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
        ) : TONTINES.length === 0 ? (
          <Text style={{ textAlign: "center", color: colors.gray, marginVertical: 24 }}>
            Aucune tontine trouvée sur votre compte www.tchoua.com.
          </Text>
        ) : null}
        {TONTINES.map((t, i) => (
          <View key={t.id ?? i} style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.typeBadge, { backgroundColor: colors.background }]}>
                <Text style={[styles.typeText, { color: colors.gray }]}>{t.type}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: t.status === "ACTIVE" || t.status === "En cours" ? colors.success + "15" : colors.primary + "15" }]}>
                <Text style={[styles.statusText, { color: t.status === "ACTIVE" || t.status === "En cours" ? colors.success : colors.primary }]}>{t.status}</Text>
              </View>
            </View>

            <Text style={[styles.name, { color: colors.text }]}>{t.name}</Text>

            <View style={[styles.details, { backgroundColor: colors.background }]}>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.gray }]}>Montant</Text>
                <Text style={[styles.detailValue, { color: colors.primary }]}>{t.amount}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.gray }]}>Membres</Text>
                <Text style={[styles.detailValue, { color: colors.primary }]}>{t.members}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.gray }]}>Association</Text>
                <Text style={[styles.detailValue, { color: colors.primary }]}>{t.nextDate}</Text>
              </View>
            </View>

            <View style={styles.flexBadges}>
              <View style={[styles.flexBadge, { backgroundColor: colors.primary + "12" }]}>
                <Text style={[styles.flexBadgeText, { color: colors.primary }]}>
                  {formatShareFraction(t.minShareFraction)}
                </Text>
              </View>
              {t.beneficiaryAmountPerShare ? (
                <View style={[styles.flexBadge, { backgroundColor: colors.secondary + "15" }]}>
                  <Text style={[styles.flexBadgeText, { color: colors.secondary }]}>
                    Part: {t.beneficiaryAmountPerShare.toLocaleString("fr-FR")} F
                  </Text>
                </View>
              ) : null}
              <View style={[styles.flexBadge, { backgroundColor: colors.background }]}>
                <Text style={[styles.flexBadgeText, { color: colors.gray }]}>
                  {CYCLE_MODE_LABELS[t.cycleMode] ?? t.cycleMode}
                </Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressInfo}>
                <Text style={[styles.progressLabel, { color: colors.gray }]}>Progression du cycle</Text>
                <Text style={[styles.progressPercent, { color: colors.primary }]}>{Math.round(t.progress * 100)}%</Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: colors.background }]}>
                <View style={[styles.progressFill, { width: `${t.progress * 100}%`, backgroundColor: colors.secondary }]} />
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.payButton, { flex: 1, backgroundColor: colors.primary }]}
                onPress={() => {
                  setPayTarget(t);
                  setPayFraction(1);
                }}
              >
                <Text style={styles.payButtonText}>PAYER MA COTISATION</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cycleButton, { borderColor: colors.primary }]}
                onPress={() =>
                  navigation?.navigate?.("cycle_tontine", {
                    activityId: t.id,
                    associationId: t.associationId,
                    name: t.name,
                  })
                }
              >
                <Text style={[styles.cycleButtonText, { color: colors.primary }]}>CYCLE</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={[styles.fab, { borderColor: colors.primary, backgroundColor: colors.surface }]} onPress={() => setJoinModal(true)}>
        <Text style={[styles.fabText, { color: colors.primary }]}>+ Rejoindre une tontine</Text>
      </TouchableOpacity>

      {/* Payment Modal */}
      <Modal visible={Boolean(payTarget)} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.lg }}>
            <Text style={{ fontSize: 18, fontWeight: "900", color: colors.text }}>
              Payer ma cotisation
            </Text>
            <Text style={{ fontSize: 13, color: colors.gray, marginBottom: SPACING.md }}>
              {payTarget?.name}
            </Text>

            <Text style={{ fontSize: 12, fontWeight: "800", color: colors.gray, marginBottom: 6 }}>
              Fraction de part
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: SPACING.md }}>
              {[1, 0.5, 0.25]
                .filter((f) => !payTarget || f >= payTarget.minShareFraction)
                .map((f) => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setPayFraction(f)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: payFraction === f ? colors.primary : colors.lightGray,
                      backgroundColor: payFraction === f ? colors.primary : colors.background,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontWeight: "800", fontSize: 12, color: payFraction === f ? "#fff" : colors.text }}>
                      {f === 1 ? "1 part" : `${f} part`}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>

            <Text style={{ fontSize: 12, fontWeight: "800", color: colors.gray, marginBottom: 6 }}>
              Mode de paiement
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: SPACING.md }}>
              {(
                [
                  { id: "MOBILE_MONEY", label: "Mobile Money" },
                  { id: "CASH", label: "Espèces" },
                  { id: "BANK", label: "Virement" },
                ] as const
              ).map((m) => (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => setPayMethod(m.id)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: payMethod === m.id ? colors.secondary : colors.lightGray,
                    backgroundColor: payMethod === m.id ? colors.secondary : colors.background,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontWeight: "800", fontSize: 11, color: payMethod === m.id ? "#fff" : colors.text }}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ padding: 12, borderRadius: 12, backgroundColor: colors.background, marginBottom: SPACING.md }}>
              <Text style={{ fontSize: 12, color: colors.gray }}>Montant à régler</Text>
              <Text style={{ fontSize: 22, fontWeight: "900", color: colors.primary }}>
                {payTarget ? Math.round(payTarget.amountNum * payFraction).toLocaleString("fr-FR") : 0} F
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: SPACING.sm }}>
              <TouchableOpacity
                onPress={() => setPayTarget(null)}
                style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: colors.lightGray, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "700", color: colors.text }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmPayment}
                style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: colors.primary, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "900", color: "#fff" }}>CONFIRMER</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Join Tontine Modal */}
      <Modal visible={joinModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: SPACING.lg }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: SPACING.lg }}>
            <Text style={{ fontSize: 18, fontWeight: "900", color: COLORS.primary, marginBottom: SPACING.md }}>
              Rejoindre une association
            </Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: colors.lightGray, borderRadius: 12, padding: 12, color: colors.text, marginBottom: SPACING.md }}
              placeholder="Code d'invitation (www.tchoua.com)"
              placeholderTextColor={colors.gray}
              value={joinCode}
              onChangeText={setJoinCode}
              autoCapitalize="characters"
            />
            <View style={{ flexDirection: "row", gap: SPACING.sm }}>
              <TouchableOpacity
                onPress={() => setJoinModal(false)}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: colors.lightGray, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "700", color: colors.text }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmJoin}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: colors.primary, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "800", color: "#fff" }}>Rejoindre</Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: "600",
    marginTop: 4,
  },
  list: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: SPACING.lg,
    ...SHADOW.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  typeBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.gray,
    textTransform: "uppercase",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  name: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.black,
    marginBottom: SPACING.lg,
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 20,
  },
  detailItem: {
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 10,
    color: COLORS.gray,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primary,
  },
  progressContainer: {
    marginBottom: SPACING.lg,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: "600",
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.secondary,
    borderRadius: 4,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  payButtonText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },
  flexBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: SPACING.md,
  },
  flexBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  flexBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  actionsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  cycleButton: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cycleButtonText: {
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },
  fab: {
    margin: SPACING.md,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderStyle: "dashed",
  },
  fabText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 15,
  },
});
