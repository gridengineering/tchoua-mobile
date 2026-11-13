import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { SHADOW, SPACING } from "../../theme";

const INITIAL_TIPS = [
  {
    title: "Optimisez vos parts de tontine",
    body: "Avec votre score de fiabilité de 98%, vous êtes éligible à la souscription de demi-parts supplémentaires sur la Tontine Scolaire A30.",
  },
  {
    title: "Répartition d'intérêts en hausse",
    body: "Vos prêts remboursés à temps ont généré +18 750 F de quote-part d'intérêts cette saison.",
  },
];

export const ConseilsIAScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState<Array<{ q: string; a: string }>>([]);

  const askAi = () => {
    const q = question.trim();
    if (!q) return;
    const lower = q.toLowerCase();
    let reply =
      "Selon votre historique de cotisations (98% de ponctualité), votre capacité d'emprunt est estimée à 1 200 000 F et votre épargne projetée sur 6 mois atteint 290 000 F.";
    if (lower.includes("part") || lower.includes("tontine")) {
      reply =
        "Vous pouvez souscrire en part entière ou en fraction (1/2 ou 1/4) selon la configuration du cycle de la tontine.";
    } else if (lower.includes("intérêt") || lower.includes("interet") || lower.includes("dividende")) {
      reply =
        "Les intérêts des remboursements de prêts sont répartis au prorata de votre capital détenu dans la caisse à la date du décaissement.";
    }
    setAnswers((prev) => [{ q, a: reply }, ...prev]);
    setQuestion("");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.lightGray },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Conseils IA</Text>
      </View>

      <View style={styles.section}>
        <View style={[styles.askBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.askLabel, { color: colors.text }]}>
            Poser une question financière
          </Text>
          <TextInput
            style={[styles.input, { borderColor: colors.lightGray, color: colors.text }]}
            placeholder="Ex: Quelle est ma capacité d'emprunt ou ma part d'intérêts ?"
            placeholderTextColor={colors.gray}
            value={question}
            onChangeText={setQuestion}
          />
          <TouchableOpacity
            onPress={askAi}
            style={[styles.askBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.askBtnText}>ANALYSER</Text>
          </TouchableOpacity>
        </View>

        {answers.map((item, idx) => (
          <View key={idx} style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.qText, { color: colors.secondary }]}>Q : {item.q}</Text>
            <Text style={[styles.body, { color: colors.text }]}>{item.a}</Text>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommandations</Text>
        {INITIAL_TIPS.map((tip, idx) => (
          <View key={idx} style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.primary }]}>🤖 {tip.title}</Text>
            <Text style={[styles.body, { color: colors.gray }]}>{tip.body}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: { marginRight: SPACING.md },
  backText: { fontSize: 16, fontWeight: "700" },
  title: { fontSize: 20, fontWeight: "900" },
  section: { padding: SPACING.lg },
  askBox: { borderRadius: 18, padding: SPACING.md, marginBottom: SPACING.lg, ...SHADOW.sm },
  askLabel: { fontSize: 14, fontWeight: "800", marginBottom: SPACING.sm },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    marginBottom: SPACING.sm,
  },
  askBtn: { paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  askBtnText: { color: "#fff", fontWeight: "900", fontSize: 12, letterSpacing: 1 },
  sectionTitle: { fontSize: 16, fontWeight: "900", marginBottom: SPACING.sm },
  card: { borderRadius: 16, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm },
  cardTitle: { fontSize: 14, fontWeight: "900", marginBottom: 4 },
  qText: { fontSize: 13, fontWeight: "800", marginBottom: 4 },
  body: { fontSize: 13, lineHeight: 19 },
});
