import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiGet, apiPost } from "../../api/client";
import { useTheme } from "../../context/ThemeContext";
import { SHADOW, SPACING } from "../../theme";

export const ConseilsIAScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [question, setQuestion] = useState("");
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [answers, setAnswers] = useState<Array<{ q: string; a: string }>>([]);

  const loadAdvice = useCallback(async () => {
    try {
      const res = await apiGet<{ advice?: string[] }>("/ai/advice");
      setTips(Array.isArray(res.advice) ? res.advice : []);
    } catch {
      // Keep cached/empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdvice();
  }, [loadAdvice]);

  const askAi = async () => {
    const q = question.trim();
    if (!q || sending) return;
    setSending(true);
    try {
      const res = await apiPost<{ reply?: string; answer?: string; advice?: string[] }>("/ai/advice", {
        question: q,
      });
      const reply =
        res.reply ||
        res.answer ||
        (Array.isArray(res.advice) ? res.advice.join("\n") : "Conseil généré.");
      setAnswers((prev) => [{ q, a: reply }, ...prev]);
      setQuestion("");
    } catch (err: any) {
      setAnswers((prev) => [
        { q, a: err?.message || "Impossible de joindre l'assistant IA hors ligne." },
        ...prev,
      ]);
    } finally {
      setSending(false);
    }
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
        <Text style={[styles.title, { color: colors.text }]}>Conseils IA Tchoua</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Poser une question</Text>
        <View style={[styles.askBox, { backgroundColor: colors.surface }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Ex: Quelle est ma capacité d'emprunt ?"
            placeholderTextColor={colors.gray}
            value={question}
            onChangeText={setQuestion}
          />
          <TouchableOpacity
            onPress={askAi}
            style={[styles.askBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.askBtnText}>{sending ? "..." : "Analyser"}</Text>
          </TouchableOpacity>
        </View>

        {answers.map((item, idx) => (
          <View key={idx} style={[styles.tipCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.tipTitle, { color: colors.primary }]}>Q: {item.q}</Text>
            <Text style={[styles.tipBody, { color: colors.text }]}>{item.a}</Text>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: SPACING.md }]}>
          Recommandations automatiques
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 12 }} />
        ) : (
          tips.map((tip, idx) => (
            <View key={idx} style={[styles.tipCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.tipBody, { color: colors.text }]}>{tip}</Text>
            </View>
          ))
        )}
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
  sectionTitle: { fontSize: 15, fontWeight: "900", marginBottom: SPACING.sm },
  askBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 8,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  input: { flex: 1, fontSize: 14, paddingHorizontal: 10 },
  askBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  askBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  tipCard: {
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  tipTitle: { fontSize: 14, fontWeight: "800", marginBottom: 4 },
  tipBody: { fontSize: 13, lineHeight: 19 },
});
