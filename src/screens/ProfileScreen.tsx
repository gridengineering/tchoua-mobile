import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { COLORS, SPACING, SHADOW } from "../theme";

const { width } = Dimensions.get("window");

export const ProfileScreen = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>M</Text>
            </View>
            <TouchableOpacity style={styles.editBadge}>
              <Text style={{ fontSize: 12 }}>📷</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>Marie Ngono</Text>
          <Text style={styles.location}>Yaoundé, Cameroun</Text>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>NIVEAU : AMBASSADRICE 🏆</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>850</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>98%</Text>
            <Text style={styles.statLabel}>Fiabilité</Text>
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
        <View style={styles.menu}>
          {[
            { l: "Mon Portefeuille", i: "👛", r: "145 000 F" },
            { l: "Sécurité & Biométrie", i: "🔒", r: "Activé" },
            { l: "Paramètres", i: "⚙️" },
            { l: "Langue", i: "🌐", r: "Français" },
            { l: "Support & Aide", i: "🎧" },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Text style={{ fontSize: 18 }}>{item.i}</Text>
              </View>
              <Text style={styles.menuLabel}>{item.l}</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {item.r && <Text style={styles.menuRight}>{item.r}</Text>}
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>DÉCONNEXION</Text>
        </TouchableOpacity>
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
});
