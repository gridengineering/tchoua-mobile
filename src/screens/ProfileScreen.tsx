import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  Dimensions,
} from "react-native";
import { getBaseUrl, setBaseUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { ALL_LANGS, LANG_FLAGS, LANG_LABELS } from "../i18n";
import { COLORS, MEMBER_THEMES, SPACING, SHADOW } from "../theme";
import { confirmAction, showAlert } from "../utils/feedback";

const { width } = Dimensions.get("window");

export const ProfileScreen = ({ navigation }: any) => {
  const { themeId, colors, setTheme } = useTheme();
  const { user, lang, setLang, logout } = useAuth();
  const [biometry, setBiometry] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [langModal, setLangModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [apiUrl, setApiUrl] = useState(getBaseUrl());

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.editBadge, { backgroundColor: colors.secondary }]}
              onPress={() => showAlert("Photo de profil", `Connecté en tant que ${user.name} (${user.email}).`)}
            >
              <Text style={{ fontSize: 12 }}>📷</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.location}>{user.location}</Text>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>NIVEAU : AMBASSADRICE 🏆</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>850</Text>
            <Text style={[styles.statLabel, { color: colors.gray }]}>Points</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>12</Text>
            <Text style={[styles.statLabel, { color: colors.gray }]}>Badges</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>98%</Text>
            <Text style={[styles.statLabel, { color: colors.gray }]}>Fiabilité</Text>
          </View>
        </View>

        {/* Theme Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Thème d&apos;apparence</Text>
          <View style={styles.themesGrid}>
            {MEMBER_THEMES.map((th) => {
              const active = themeId === th.id;
              return (
                <TouchableOpacity
                  key={th.id}
                  onPress={() => setTheme(th.id)}
                  style={[
                    styles.themeCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: active ? colors.secondary : colors.lightGray,
                      borderWidth: active ? 2 : 1,
                    },
                  ]}
                >
                  <View style={styles.swatchRow}>
                    {th.swatches.map((hex, idx) => (
                      <View key={idx} style={[styles.swatchDot, { backgroundColor: hex }]} />
                    ))}
                  </View>
                  <Text style={[styles.themeName, { color: colors.text }]}>{th.name}</Text>
                  <Text style={[styles.themeTag, { color: colors.gray }]} numberOfLines={1}>
                    {th.tagline}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Gamification Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ma Progression</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Vers le niveau "Légende"</Text>
              <Text style={styles.progressValue}>850 / 1000 pts</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "85%" }]} />
            </View>
          </View>
        </View>

        {/* Badges Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes Badges</Text>
          <View style={styles.badgesGrid}>
            {[
              { e: "⏰", l: "Ponctuelle" },
              { e: "🤝", l: "Solidaire" },
              { e: "💰", l: "Épargnante" },
              { e: "📜", l: "Fondatrice" },
              { e: "🏅", l: "Experte" },
              { e: "💎", l: "Premium" },
            ].map((b, i) => (
              <View key={i} style={styles.badgeItem}>
                <View style={styles.badgeIcon}>
                  <Text style={{ fontSize: 28 }}>{b.e}</Text>
                </View>
                <Text style={styles.badgeLabel}>{b.l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View style={[styles.menu, { backgroundColor: colors.surface }]}>
          {[
            {
              l: "Mon Portefeuille",
              i: "👛",
              r: "145 000 F",
              onPress: () => navigation?.navigate?.("wallet"),
            },
            {
              l: "Sécurité & Biométrie",
              i: "🔒",
              r: biometry ? "Activé" : "Désactivé",
              onPress: () => {
                setBiometry((v) => !v);
                showAlert("Sécurité", `Verrouillage biométrique ${!biometry ? "activé" : "désactivé"}.`);
              },
            },
            {
              l: "Paramètres",
              i: "⚙️",
              onPress: () => setSettingsModal(true),
            },
            {
              l: "Langue",
              i: "🌐",
              r: LANG_LABELS[lang],
              onPress: () => setLangModal(true),
            },
            {
              l: "Support & Aide",
              i: "🎧",
              onPress: () =>
                showAlert(
                  "Support Tchoua",
                  "Besoin d'aide ? Contactez le bureau de votre association ou écrivez à support@tchoua.cm."
                ),
            },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress}>
              <View style={[styles.menuIcon, { backgroundColor: colors.background }]}>
                <Text style={{ fontSize: 18 }}>{item.i}</Text>
              </View>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{item.l}</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {item.r && <Text style={[styles.menuRight, { color: colors.primary }]}>{item.r}</Text>}
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() =>
            confirmAction(
              "Déconnexion",
              "Voulez-vous vraiment vous déconnecter ?",
              () => {
                logout();
              },
              "Se déconnecter"
            )
          }
        >
          <Text style={styles.logoutText}>DÉCONNEXION</Text>
        </TouchableOpacity>
      </View>

      {/* Language Modal */}
      <Modal visible={langModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.lg }}>
            <Text style={{ fontSize: 18, fontWeight: "900", color: colors.text, marginBottom: SPACING.md }}>
              Choisir la langue
            </Text>
            {ALL_LANGS.map((l) => (
              <TouchableOpacity
                key={l}
                onPress={() => {
                  setLang(l);
                  setLangModal(false);
                }}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.lightGray,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: l === lang ? "900" : "600", color: colors.text }}>
                  {LANG_FLAGS[l]} {LANG_LABELS[l]}
                </Text>
                {l === lang && <Text style={{ color: colors.secondary, fontWeight: "900" }}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setLangModal(false)}
              style={{ marginTop: SPACING.md, padding: 14, borderRadius: 12, backgroundColor: colors.lightGray, alignItems: "center" }}
            >
              <Text style={{ fontWeight: "800", color: colors.text }}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={settingsModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: SPACING.lg }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: SPACING.lg }}>
            <Text style={{ fontSize: 18, fontWeight: "900", color: colors.text, marginBottom: SPACING.md }}>
              Paramètres
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.md }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>Notifications push</Text>
              <Switch value={notifications} onValueChange={setNotifications} />
            </View>
            <Text style={{ fontSize: 12, fontWeight: "700", color: colors.gray, marginBottom: 4 }}>
              URL du serveur API
            </Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: colors.lightGray, borderRadius: 10, padding: 10, color: colors.text, marginBottom: SPACING.md }}
              value={apiUrl}
              onChangeText={setApiUrl}
              autoCapitalize="none"
            />
            <View style={{ flexDirection: "row", gap: SPACING.sm }}>
              <TouchableOpacity
                onPress={() => setSettingsModal(false)}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: colors.lightGray, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "700", color: colors.text }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setBaseUrl(apiUrl.trim() || "http://localhost:3000/api");
                  setSettingsModal(false);
                  showAlert("Paramètres", "Configuration enregistrée.");
                }}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: colors.primary, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "800", color: "#fff" }}>Enregistrer</Text>
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
    backgroundColor: COLORS.primary,
    paddingTop: 40,
    paddingBottom: 60,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: "center",
  },
  profileInfo: {
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatarText: {
    fontSize: 48,
    fontWeight: "900",
    color: COLORS.primary,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    borderWidth: 3,
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.white,
  },
  location: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
  rankBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  rankText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1,
  },
  content: {
    padding: SPACING.lg,
    marginTop: -40,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.xl,
  },
  statCard: {
    width: (width - SPACING.lg * 2 - 24) / 3,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.md,
    alignItems: "center",
    ...SHADOW.sm,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: "600",
    marginTop: 2,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  progressCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 20,
    ...SHADOW.sm,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: "600",
  },
  progressValue: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.primary,
  },
  progressBar: {
    height: 10,
    backgroundColor: COLORS.background,
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.secondary,
    borderRadius: 5,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  badgeItem: {
    width: (width - SPACING.lg * 2 - 24) / 3,
    alignItems: "center",
  },
  badgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    ...SHADOW.sm,
  },
  badgeLabel: {
    fontSize: 11,
    color: COLORS.black,
    fontWeight: "700",
    textAlign: "center",
  },
  menu: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.sm,
    marginBottom: SPACING.xl,
    ...SHADOW.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.black,
  },
  menuRight: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "800",
    marginRight: 8,
  },
  chevron: {
    fontSize: 18,
    color: COLORS.lightGray,
    fontWeight: "900",
  },
  logoutButton: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.danger + "15",
    alignItems: "center",
  },
  logoutText: {
    color: COLORS.danger,
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 1,
  },
  themesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  themeCard: {
    width: (width - SPACING.lg * 2 - SPACING.sm * 2) / 3,
    borderRadius: 14,
    padding: SPACING.sm,
    ...SHADOW.sm,
  },
  swatchRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 6,
  },
  swatchDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  themeName: {
    fontSize: 12,
    fontWeight: "800",
  },
  themeTag: {
    fontSize: 10,
    marginTop: 1,
  },
});
