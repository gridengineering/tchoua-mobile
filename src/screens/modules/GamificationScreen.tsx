import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { COLORS, SPACING, SHADOW } from "../../theme";

const { width } = Dimensions.get("window");

export const GamificationScreen = ({ navigation }: any) => {
  const BADGES = [
    { label: "Ponctuelle", icon: "⏰", date: "12/04/2026" },
    { label: "Solidaire", icon: "🤝", date: "25/03/2026" },
    { label: "Épargnante", icon: "💰", date: "05/02/2026" },
    { label: "Fondatrice", icon: "📜", date: "01/01/2026" },
  ];

  const CHALLENGES = [
    { title: "Série de Cotisations", desc: "Payer 5 cotisations d'affilée sans retard.", progress: 0.8, reward: "Badge 'Fiable'" },
    { title: "Parrainage", desc: "Inviter 3 nouveaux membres actifs.", progress: 0.33, reward: "500 Points" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Gamification</Text>
      </View>

      <View style={styles.scoreHero}>
        <Text style={styles.scoreLabel}>Mon Score Global</Text>
        <Text style={styles.scoreValue}>850 PTS</Text>
        <View style={styles.levelProgress}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelName}>AMBASSADRICE</Text>
            <Text style={styles.nextLevel}>Légende : 1000 pts</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "85%" }]} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes Badges Récents</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll}>
          {BADGES.map((badge, i) => (
            <View key={i} style={styles.badgeCard}>
              <View style={styles.badgeIcon}>
                <Text style={{ fontSize: 32 }}>{badge.icon}</Text>
              </View>
              <Text style={styles.badgeLabel}>{badge.label}</Text>
              <Text style={styles.badgeDate}>{badge.date}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Défis en cours</Text>
        {CHALLENGES.map((challenge, i) => (
          <View key={i} style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              <View style={styles.rewardTag}>
                <Text style={styles.rewardText}>🎁 {challenge.reward}</Text>
              </View>
            </View>
            <Text style={styles.challengeDesc}>{challenge.desc}</Text>
            <View style={styles.challengeProgress}>
              <View style={[styles.progressBar, { height: 6 }]}>
                <View style={[styles.progressFill, { width: `${challenge.progress * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(challenge.progress * 100)}%</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Classement Mensuel</Text>
        <View style={styles.rankingList}>
          {[
            { rank: 1, name: "Jean-Pierre T.", points: 1250, avatar: "J" },
            { rank: 2, name: "Marie N. (Moi)", points: 850, avatar: "M", me: true },
            { rank: 3, name: "Amina K.", points: 720, avatar: "A" },
          ].map((user, i) => (
            <View key={i} style={[styles.rankingItem, user.me && styles.rankingItemMe]}>
              <Text style={styles.rankNumber}>{user.rank}</Text>
              <View style={[styles.avatar, { backgroundColor: user.me ? COLORS.secondary : COLORS.primary }]}>
                <Text style={styles.avatarText}>{user.avatar}</Text>
              </View>
              <Text style={[styles.userName, user.me && styles.userNameMe]}>{user.name}</Text>
              <Text style={[styles.userPoints, user.me && styles.userPointsMe]}>{user.points} pts</Text>
            </View>
          ))}
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
  scoreHero: {
    margin: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: 32,
    padding: SPACING.xl,
    alignItems: "center",
    ...SHADOW.md,
  },
  scoreLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  scoreValue: {
    color: COLORS.white,
    fontSize: 42,
    fontWeight: "900",
    marginBottom: 20,
  },
  levelProgress: {
    width: "100%",
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  levelName: {
    color: COLORS.secondary,
    fontWeight: "900",
    fontSize: 12,
  },
  nextLevel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: "600",
  },
  progressBar: {
    height: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.secondary,
    borderRadius: 5,
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
  badgeScroll: {
    marginLeft: -SPACING.lg,
    paddingLeft: SPACING.lg,
  },
  badgeCard: {
    width: 120,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.md,
    alignItems: "center",
    marginRight: 12,
    ...SHADOW.sm,
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.black,
    textAlign: "center",
  },
  badgeDate: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 4,
  },
  challengeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.black,
    flex: 1,
  },
  rewardTag: {
    backgroundColor: COLORS.secondary + "15",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rewardText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.secondary,
  },
  challengeDesc: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
    marginBottom: 12,
  },
  challengeProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.primary,
  },
  rankingList: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    overflow: "hidden",
    ...SHADOW.sm,
  },
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  rankingItemMe: {
    backgroundColor: COLORS.primary + "08",
  },
  rankNumber: {
    width: 24,
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.gray,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: "700",
  },
  userName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
  },
  userNameMe: {
    fontWeight: "900",
    color: COLORS.primary,
  },
  userPoints: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.gray,
  },
  userPointsMe: {
    color: COLORS.secondary,
  },
});
