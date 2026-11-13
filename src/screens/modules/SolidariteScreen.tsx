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

export const SolidariteScreen = ({ navigation, route }: any) => {
  const [aidModal, setAidModal] = useState(false);
  const [category, setCategory] = useState("Caisse Naissance");
  const [amount, setAmount] = useState("50000");
  const [reason, setReason] = useState("");
  const [requests, setRequests] = useState([
    { id: "1", title: "🍼 Aide Naissance - J. Kamdem", status: "Vérification", step: 2 },
  ]);

  useEffect(() => {
    if (route?.params?.openAidModal) {
      setAidModal(true);
    }
  }, [route?.params?.openAidModal]);

  const CAISSES = [
    { label: "Caisse Décès", icon: "🕊️", balance: "250k F", help: "Demander aide" },
    { label: "Caisse Naissance", icon: "👶", balance: "120k F", help: "Déclarer" },
    { label: "Caisse Mariage", icon: "💒", balance: "300k F", help: "Déclarer" },
    { label: "Caisse Santé", icon: "🏥", balance: "450k F", help: "Urgence" },
  ];

  const submitAid = () => {
    const amt = Number(amount.replace(/\s+/g, ""));
    if (!amt || amt <= 0) {
      showAlert("Montant invalide", "Veuillez saisir un montant valide.");
      return;
    }
    setRequests((prev) => [
      {
        id: String(Date.now()),
        title: `🤝 ${category} (${amt.toLocaleString("fr-FR")} F)`,
        status: "Soumis",
        step: 1,
      },
      ...prev,
    ]);
    setReason("");
    setAidModal(false);
    showAlert("Demande enregistrée", `Votre demande "${category}" a été transmise au bureau.`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Solidarité</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>La force du collectif</Text>
        <Text style={styles.heroDesc}>Découvrez et gérez les aides communautaires disponibles dans vos associations.</Text>
      </View>

      <View style={styles.grid}>
        {CAISSES.map((caisse, i) => (
          <TouchableOpacity
            key={i}
            style={styles.caisseCard}
            onPress={() => {
              setCategory(caisse.label);
              setAidModal(true);
            }}
          >
            <View style={styles.caisseIcon}>
              <Text style={{ fontSize: 32 }}>{caisse.icon}</Text>
            </View>
            <Text style={styles.caisseLabel}>{caisse.label}</Text>
            <Text style={styles.caisseBalance}>{caisse.balance}</Text>
            <TouchableOpacity
              style={styles.caisseAction}
              onPress={() => {
                setCategory(caisse.label);
                setAidModal(true);
              }}
            >
              <Text style={styles.caisseActionText}>{caisse.help}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demandes en cours</Text>
        {requests.map((r) => (
          <View key={r.id} style={[styles.requestCard, { marginBottom: SPACING.sm }]}>
            <View style={styles.requestHeader}>
              <Text style={styles.requestType}>{r.title}</Text>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{r.status}</Text>
              </View>
            </View>
            <View style={styles.timeline}>
              <View style={[styles.timelineDot, r.step >= 1 && styles.dotActive]} />
              <View style={[styles.timelineLine, r.step >= 2 && styles.lineActive]} />
              <View style={[styles.timelineDot, r.step >= 2 && styles.dotActive]} />
              <View style={[styles.timelineLine, r.step >= 3 && styles.lineActive]} />
              <View style={[styles.timelineDot, r.step >= 3 && styles.dotActive]} />
            </View>
            <View style={styles.timelineLabels}>
              <Text style={r.step >= 1 ? styles.labelActive : undefined}>Soumis</Text>
              <Text style={r.step >= 2 ? styles.labelActive : undefined}>Validé</Text>
              <Text style={r.step >= 3 ? styles.labelActive : undefined}>Payé</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.mainAction} onPress={() => setAidModal(true)}>
        <Text style={styles.mainActionText}>+ CRÉER UNE NOUVELLE DEMANDE</Text>
      </TouchableOpacity>

      <Modal visible={aidModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: SPACING.lg }}>
          <View style={{ backgroundColor: COLORS.white, borderRadius: 20, padding: SPACING.lg }}>
            <Text style={{ fontSize: 18, fontWeight: "900", color: COLORS.primary, marginBottom: SPACING.sm }}>
              Demander une aide solidaire
            </Text>
            <Text style={{ fontSize: 13, color: COLORS.gray, marginBottom: SPACING.md }}>
              Catégorie : {category}
            </Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 12, padding: 12, marginBottom: SPACING.sm }}
              placeholder="Montant souhaité (FCFA)"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <TextInput
              style={{ borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 12, padding: 12, marginBottom: SPACING.md }}
              placeholder="Motif / justificatif"
              value={reason}
              onChangeText={setReason}
            />
            <View style={{ flexDirection: "row", gap: SPACING.sm }}>
              <TouchableOpacity
                onPress={() => setAidModal(false)}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: COLORS.lightGray, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "700", color: COLORS.black }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submitAid}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "800", color: COLORS.white }}>Envoyer</Text>
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
  hero: {
    padding: SPACING.xl,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.white,
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: SPACING.md,
    gap: 12,
    marginTop: -20,
  },
  caisseCard: {
    width: (width - SPACING.md * 2 - 12) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.lg,
    alignItems: "center",
    ...SHADOW.sm,
  },
  caisseIcon: {
    marginBottom: SPACING.md,
  },
  caisseLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 4,
  },
  caisseBalance: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: "600",
    marginBottom: SPACING.md,
  },
  caisseAction: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  caisseActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.lg,
    ...SHADOW.sm,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  requestType: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.black,
    flex: 1,
  },
  tag: {
    backgroundColor: COLORS.warning + "15",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.warning,
  },
  timeline: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.lightGray,
  },
  dotActive: {
    backgroundColor: COLORS.success,
  },
  timelineLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.lightGray,
  },
  lineActive: {
    backgroundColor: COLORS.success,
  },
  timelineLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  labelActive: {
    color: COLORS.success,
    fontWeight: "700",
    fontSize: 11,
  },
  mainAction: {
    margin: SPACING.lg,
    backgroundColor: COLORS.terracotta,
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
    ...SHADOW.md,
  },
  mainActionText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 1,
  },
});
