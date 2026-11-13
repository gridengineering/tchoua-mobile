import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { apiPost } from "../../api/client";
import { useTheme } from "../../context/ThemeContext";
import { SHADOW, SPACING } from "../../theme";
import { ASSOC_TYPE_META, AssocType } from "../../types/association";
import { showAlert } from "../../utils/feedback";

const TYPE_OPTIONS: AssocType[] = [
  "TONTINE_CLUB",
  "AMICALE",
  "SECTION",
  "FEDERATION",
  "COOPERATIVE",
  "SOLIDARITY",
  "INVESTMENT",
  "AGRICULTURAL",
  "MUTUAL",
  "CULTURAL",
  "PROFESSIONAL",
  "OTHER",
];

export const CreateAssociationScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [type, setType] = useState<AssocType>("AMICALE");
  const [city, setCity] = useState("Yaoundé");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      showAlert("Nom requis", "Veuillez saisir le nom de l'association.");
      return;
    }
    setSaving(true);
    try {
      await apiPost("/associations", {
        name: name.trim(),
        type,
        city: city.trim(),
        description: description.trim(),
      });
    } catch {
      // Queued for sync when online
    } finally {
      setSaving(false);
    }
    showAlert(
      "Association créée",
      `"${name.trim()}" (${ASSOC_TYPE_META[type].label}) a été enregistrée.`
    );
    navigation.goBack();
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
        <Text style={[styles.title, { color: colors.text }]}>Créer une association</Text>
      </View>

      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.gray }]}>Nom de l&apos;association</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.lightGray, color: colors.text }]}
          placeholder="Ex: Amicale des Élites / Section Yaoundé"
          placeholderTextColor={colors.gray}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.label, { color: colors.gray }]}>Forme / Modèle</Text>
        <View style={styles.typesGrid}>
          {TYPE_OPTIONS.map((t) => {
            const active = type === t;
            const meta = ASSOC_TYPE_META[t];
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.lightGray,
                  },
                ]}
              >
                <Text style={{ fontSize: 14, marginRight: 6 }}>{meta.icon}</Text>
                <Text style={[styles.typeLabel, { color: active ? "#fff" : colors.text }]}>
                  {meta.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, { color: colors.gray }]}>Ville</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.lightGray, color: colors.text }]}
          placeholder="Ville"
          placeholderTextColor={colors.gray}
          value={city}
          onChangeText={setCity}
        />

        <Text style={[styles.label, { color: colors.gray }]}>Description</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, borderColor: colors.lightGray, color: colors.text, height: 90 },
          ]}
          placeholder="Objet et activités principales..."
          placeholderTextColor={colors.gray}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={saving}
          style={[styles.submitBtn, { backgroundColor: colors.secondary }]}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>CRÉER L&apos;ASSOCIATION</Text>
          )}
        </TouchableOpacity>
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
  form: { padding: SPACING.lg },
  label: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  typesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: SPACING.sm,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  typeLabel: { fontSize: 12, fontWeight: "700" },
  submitBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: SPACING.md,
    ...SHADOW.sm,
  },
  submitText: { color: "#fff", fontWeight: "900", fontSize: 13, letterSpacing: 1 },
});
