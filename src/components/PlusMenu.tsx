import React, { useMemo } from "react";
import {
  View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, Dimensions,
} from "react-native";
import { COLORS, SPACING, SHADOW } from "../theme";

const { height } = Dimensions.get("window");

interface PlusMenuProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  associationRole?: string | null;
  inAssociation?: boolean;
}

type MenuModule = {
  id: string;
  label: string;
  icon: string;
  section: "association" | "finances" | "community" | "learning" | "global";
  bureauOnly?: boolean;
  associationOnly?: boolean;
};

const MODULES: MenuModule[] = [
  { id: "parcours", label: "Mon parcours", icon: "🧭", section: "global" },
  { id: "ComptesAssociation", label: "Compte association", icon: "🏦", section: "association", associationOnly: true },
  { id: "sessions", label: "Réunions & sessions", icon: "📅", section: "association", associationOnly: true },
  { id: "membres", label: "Membres", icon: "👥", section: "association", associationOnly: true },
  { id: "historique", label: "Historique financier", icon: "📜", section: "association", associationOnly: true },
  { id: "interets", label: "Intérêts & dividendes", icon: "✨", section: "association", associationOnly: true },
  { id: "rapports", label: "Rapports", icon: "📈", section: "association", associationOnly: true },
  { id: "wallet", label: "Portefeuille (Wallet)", icon: "👛", section: "finances", associationOnly: true },
  { id: "epargne", label: "Épargne & investissement", icon: "🏦", section: "finances", associationOnly: true },
  { id: "prets", label: "Prêts & crédit", icon: "💳", section: "finances", associationOnly: true },
  { id: "solidarite", label: "Solidarité", icon: "🤝", section: "finances", associationOnly: true },
  { id: "arp", label: "Cadre ARP & fonds", icon: "🏛️", section: "finances", associationOnly: true, bureauOnly: true },
  { id: "marketplace", label: "Marketplace", icon: "🛒", section: "community", associationOnly: true },
  { id: "evenements", label: "Événements", icon: "🎉", section: "community", associationOnly: true },
  { id: "conseils", label: "Conseils IA", icon: "🤖", section: "learning" },
  { id: "gamification", label: "Gamification", icon: "🏆", section: "learning" },
  { id: "academie", label: "Académie", icon: "🎓", section: "learning" },
  { id: "calendar", label: "Calendrier financier", icon: "📆", section: "global", associationOnly: true },
];

const QUICK_ACTIONS = [
  { id: "versement", label: "Effectuer un versement", icon: "💸", associationOnly: true },
  { id: "aide", label: "Demander une aide", icon: "🤲", associationOnly: true },
  { id: "pret_req", label: "Solliciter un prêt", icon: "💳", associationOnly: true },
  { id: "create_assoc", label: "Créer une association", icon: "📝", associationOnly: false },
];

const BUREAU_ROLES = new Set([
  "FOUNDER", "PRESIDENT", "VICE_PRESIDENT", "SECRETARY", "SECRETARY_ADJ",
  "TREASURER", "TREASURER_ADJ", "CENSOR", "AUDITOR", "SOLIDARITY_OFFICER",
]);

const SECTION_LABELS: Record<MenuModule["section"], string> = {
  association: "Vie de l'association",
  finances: "Finances & activités",
  community: "Communauté",
  learning: "Apprendre & progresser",
  global: "Mon espace",
};

export const PlusMenu = ({ visible, onClose, onNavigate, associationRole, inAssociation = false }: PlusMenuProps) => {
  const isBureau = !associationRole || BUREAU_ROLES.has(associationRole.toUpperCase());
  const sections = useMemo(() => {
    const visibleModules = MODULES.filter((module) => {
      if (module.associationOnly && !inAssociation) return false;
      if (module.bureauOnly && !isBureau) return false;
      return true;
    });
    return (Object.keys(SECTION_LABELS) as MenuModule["section"][])
      .map((section) => ({ section, items: visibleModules.filter((m) => m.section === section) }))
      .filter((group) => group.items.length > 0);
  }, [inAssociation, isBureau]);
  const quickActions = QUICK_ACTIONS.filter((action) => !action.associationOnly || inAssociation);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Plus</Text>
              <Text style={styles.subtitle}>{inAssociation ? "Tous les outils de votre association" : "Votre espace personnel"}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}><Text style={styles.closeText}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {sections.map(({ section, items }) => (
              <View key={section} style={styles.section}>
                <Text style={styles.sectionTitle}>{SECTION_LABELS[section]}</Text>
                {items.map((module) => (
                  <TouchableOpacity key={module.id} style={styles.item} onPress={() => { onNavigate(module.id); onClose(); }}>
                    <Text style={styles.itemIcon}>{module.icon}</Text>
                    <Text style={styles.itemLabel}>{module.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actions rapides</Text>
              {quickActions.map((action) => (
                <TouchableOpacity key={action.id} style={styles.actionItem} onPress={() => { onNavigate(action.id); onClose(); }}>
                  <Text style={styles.itemIcon}>{action.icon}</Text>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  container: { backgroundColor: COLORS.background, borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: height * 0.86, paddingBottom: SPACING.xl, ...SHADOW.md },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  title: { fontSize: 22, fontWeight: "900", color: COLORS.primary },
  subtitle: { marginTop: 3, fontSize: 12, color: COLORS.gray },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.lightGray, alignItems: "center", justifyContent: "center" },
  closeText: { fontSize: 14, color: COLORS.gray, fontWeight: "bold" },
  scroll: { padding: SPACING.md },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: 11, fontWeight: "900", color: COLORS.gray, textTransform: "uppercase", letterSpacing: 1, marginBottom: SPACING.sm, paddingLeft: SPACING.xs },
  item: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: SPACING.sm, borderRadius: 12 },
  itemIcon: { fontSize: 22, marginRight: SPACING.md },
  itemLabel: { fontSize: 15, fontWeight: "600", color: COLORS.black },
  actionItem: { flexDirection: "row", alignItems: "center", paddingVertical: SPACING.sm, paddingHorizontal: SPACING.sm, marginBottom: SPACING.xs },
  actionLabel: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
  divider: { height: 1, backgroundColor: COLORS.lightGray, marginBottom: SPACING.lg, marginHorizontal: SPACING.sm },
});
