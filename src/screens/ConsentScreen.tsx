import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiOnline } from "../api/client";
import { COLORS, SPACING } from "../theme";

type ConsentDocument = {
  key: string;
  label: string;
  title: string;
  summary: string;
  accepted: boolean;
};

export function ConsentScreen({ onAccepted }: { onAccepted: () => void }) {
  const [documents, setDocuments] = useState<ConsentDocument[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiOnline<{ documents: ConsentDocument[] }>("/consents")
      .then((data) => {
        setDocuments(data.documents ?? []);
        setChecked(Object.fromEntries((data.documents ?? []).map((doc) => [doc.key, Boolean(doc.accepted)])));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Chargement impossible"))
      .finally(() => setLoading(false));
  }, []);

  const allChecked = documents.length > 0 && documents.every((doc) => checked[doc.key]);

  const accept = async () => {
    if (!allChecked) return;
    setSaving(true);
    setError(null);
    try {
      await apiOnline("/consents", { documents: documents.map((doc) => doc.key) }, "POST");
      onAccepted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.badge}><Text style={styles.badgeText}>T</Text></View>
        <Text style={styles.title}>Avant de continuer</Text>
        <Text style={styles.intro}>
          Pour protéger votre compte et les membres de vos associations, lisez et acceptez chaque document.
          Cette étape est obligatoire pour accéder à la plateforme.
        </Text>

        {loading ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 24 }} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {documents.map((doc) => (
          <TouchableOpacity
            key={doc.key}
            style={[styles.card, checked[doc.key] && styles.cardChecked]}
            onPress={() => setChecked((current) => ({ ...current, [doc.key]: !current[doc.key] }))}
            activeOpacity={0.85}
          >
            <View style={styles.check}>{checked[doc.key] ? <Text style={styles.checkText}>✓</Text> : null}</View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{doc.title}</Text>
              <Text style={styles.cardText}>{doc.summary}</Text>
              <Text style={styles.cardLabel}>J’ai lu et j’accepte : {doc.label}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.button, (!allChecked || saving) && styles.buttonDisabled]}
          onPress={accept}
          disabled={!allChecked || saving}
        >
          <Text style={styles.buttonText}>{saving ? "Enregistrement…" : "J’accepte et je continue"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f3eb" },
  content: { padding: SPACING.lg, paddingBottom: 40 },
  badge: { width: 48, height: 48, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  badgeText: { color: COLORS.white, fontWeight: "900", fontSize: 22 },
  title: { fontSize: 23, fontWeight: "900", color: COLORS.primary },
  intro: { color: COLORS.gray, fontSize: 13, lineHeight: 20, marginTop: 8, marginBottom: 16 },
  card: { flexDirection: "row", gap: 10, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 16, padding: 14, marginBottom: 10 },
  cardChecked: { borderColor: COLORS.success, backgroundColor: "#f0fdf4" },
  check: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: COLORS.primary, alignItems: "center", justifyContent: "center", marginTop: 2 },
  checkText: { color: COLORS.primary, fontWeight: "900", fontSize: 14 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 13, fontWeight: "800", color: COLORS.primary },
  cardText: { fontSize: 12, lineHeight: 18, color: COLORS.gray, marginTop: 4 },
  cardLabel: { fontSize: 11, fontWeight: "700", color: COLORS.primary, marginTop: 8 },
  button: { backgroundColor: COLORS.primary, borderRadius: 14, padding: 15, alignItems: "center", marginTop: 10 },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: COLORS.white, fontSize: 13, fontWeight: "900", letterSpacing: 0.3 },
  error: { color: COLORS.danger, fontSize: 12, fontWeight: "700", marginVertical: 8 },
});
