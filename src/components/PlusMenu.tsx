import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { COLORS, SPACING, SHADOW } from "../theme";

const { height } = Dimensions.get("window");

interface PlusMenuProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

const SECONDARY_MODULES = [
  { id: "historique", label: "Historique Financier", icon: "📜" },
  { id: "interets", label: "Intérêts & Dividendes", icon: "✨" },
  { id: "wallet", label: "Portefeuille (Wallet)", icon: "👛" },
  { id: "calendar", label: "Calendrier Financier", icon: "📆" },
  { id: "epargne", label: "Épargne & Investissement", icon: "🏦" },
  { id: "prets", label: "Prêts & Crédit", icon: "💳" },
  { id: "solidarite", label: "Solidarité", icon: "🤝" },
  { id: "sessions", label: "Sessions & Tirage", icon: "📅" },
  { id: "membres", label: "Membres", icon: "👥" },
  { id: "marketplace", label: "Marketplace", icon: "🛒" },
  { id: "evenements", label: "Événements", icon: "🎉" },
  { id: "conseils", label: "Conseils IA", icon: "🤖" },
  { id: "rapports", label: "Rapports", icon: "📈" },
  { id: "gamification", label: "Gamification", icon: "🏆" },
  { id: "academie", label: "Académie", icon: "🎓" },
];

const QUICK_ACTIONS = [
  { id: "versement", label: "Effectuer un versement", icon: "💸" },
  { id: "aide", label: "Demander une aide", icon: "🤲" },
  { id: "pret_req", label: "Solliciter un prêt", icon: "💳" },
  { id: "create_assoc", label: "Créer une association", icon: "📝" },
];

export const PlusMenu = ({ visible, onClose, onNavigate }: PlusMenuProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Menu Plus</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              {SECONDARY_MODULES.map((module) => (
                <TouchableOpacity
                  key={module.id}
                  style={styles.item}
                  onPress={() => {
                    onNavigate(module.id);
                    onClose();
                  }}
                >
                  <Text style={styles.itemIcon}>{module.icon}</Text>
                  <Text style={styles.itemLabel}>{module.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚡ Actions Rapides</Text>
              {QUICK_ACTIONS.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionItem}
                  onPress={() => {
                    onNavigate(action.id);
                    onClose();
                  }}
                >
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
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: height * 0.8,
    paddingBottom: SPACING.xl,
    ...SHADOW.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: "bold",
  },
  scroll: {
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.gray,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: SPACING.md,
    paddingLeft: SPACING.xs,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 12,
  },
  itemIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginBottom: SPACING.lg,
    marginHorizontal: SPACING.sm,
  },
});
