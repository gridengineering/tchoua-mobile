import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { apiGet, apiOnline, apiPatch, getSelectedAssociation } from "../../api/client";
import { useTheme } from "../../context/ThemeContext";
import { SHADOW, SPACING } from "../../theme";
import { showAlert } from "../../utils/feedback";

type MemberItem = {
  id: string;
  name: string;
  role: string;
  score: number;
  status: string;
  phone: string;
};

export const MembresScreen = ({ navigation, route }: any) => {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [assocId, setAssocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [addOpen, setAddOpen] = useState(route?.params?.openModal === "add");
  const [discoverOpen, setDiscoverOpen] = useState(route?.params?.openModal === "discover");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    country: "",
    city: "",
    phone: "",
    email: "",
    language: "fr",
  });
  const [inviteLinks, setInviteLinks] = useState<{ whatsappUrl?: string; smsUrl?: string; message?: string } | null>(null);
  const [phoneContacts, setPhoneContacts] = useState<Array<{ id: string; name: string; firstName: string; lastName: string; phone: string; email: string }>>([]);
  const [contactPickerMode, setContactPickerMode] = useState<"member" | "referral" | null>(null);
  const [refEmails, setRefEmails] = useState(["", "", "", "", ""]);
  const [refInfo, setRefInfo] = useState<{
    shareUrl?: string;
    mobileDownloadUrl?: string;
    whatsappUrl?: string;
    referralCode?: string;
    score?: number;
  } | null>(null);

  useEffect(() => {
    if (route?.params?.openModal === "add") setAddOpen(true);
    if (route?.params?.openModal === "discover") setDiscoverOpen(true);
  }, [route?.params?.openModal]);

  useEffect(() => {
    if (discoverOpen && !refInfo) {
      apiGet<any>("/referrals/invite")
        .then((d) => setRefInfo(d))
        .catch(() => {});
    }
  }, [discoverOpen, refInfo]);

  const loadPhoneContacts = async (mode: "member" | "referral") => {
    if (Platform.OS === "web") {
      const nav: any = typeof navigator !== "undefined" ? navigator : null;
      if (nav?.contacts && typeof nav.contacts.select === "function") {
        try {
          const picked = await nav.contacts.select(["name", "tel", "email"], { multiple: false });
          if (picked && picked.length > 0) {
            const c = picked[0];
            const fullName = Array.isArray(c.name) ? c.name[0] || "" : String(c.name || "");
            const phone = Array.isArray(c.tel) ? c.tel[0] || "" : "";
            const email = Array.isArray(c.email) ? c.email[0] || "" : "";
            if (mode === "member") {
              setForm((prev) => ({
                ...prev,
                firstName: fullName.split(" ")[0] || prev.firstName,
                lastName: fullName.split(" ").slice(1).join(" ") || prev.lastName,
                phone: phone || prev.phone,
                email: email || prev.email,
              }));
            } else if (email) {
              const emptyIdx = refEmails.findIndex((e) => !e.trim());
              if (emptyIdx >= 0) {
                const next = [...refEmails];
                next[emptyIdx] = email;
                setRefEmails(next);
              }
            }
            return;
          }
        } catch {
          // fallback below
        }
      }
      if (mode === "member") {
        handleImportContactsFile();
      } else {
        showAlert(
          "Contacts Web",
          "Sur navigateur desktop, saisissez jusqu'à 5 emails ci-dessous ou cliquez sur Partager sur WhatsApp. Sur Android/iOS (ou Chrome Android), le carnet d'adresses du téléphone s'ouvre directement."
        );
      }
      return;
    }
    try {
      const Contacts = await import("expo-contacts");
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        showAlert("Permission refusée", "Autorisez l'accès aux contacts pour sélectionner un contact.");
        return;
      }
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.FirstName, Contacts.Fields.LastName, Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
        pageSize: 150,
      });
      const mapped = (data || [])
        .filter((c: any) => (c.phoneNumbers && c.phoneNumbers.length > 0) || (c.emails && c.emails.length > 0))
        .map((c: any, idx: number) => ({
          id: String(c.id || idx),
          name: c.name || `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Contact",
          firstName: c.firstName || "",
          lastName: c.lastName || "",
          phone: c.phoneNumbers?.[0]?.number || "",
          email: c.emails?.[0]?.email || "",
        }));
      if (mapped.length === 0) {
        showAlert("Aucun contact", "Aucun contact avec numéro ou email trouvé.");
        return;
      }
      setPhoneContacts(mapped);
      setContactPickerMode(mode);
    } catch (err: any) {
      showAlert("Contacts indisponibles", err?.message || "Impossible de lire les contacts.");
    }
  };

  const handleAddMember = async () => {
    if (!assocId) return;
    if (!form.phone.trim() && !form.email.trim()) {
      showAlert("Champ requis", "Le numéro mobile ou l'email est obligatoire.");
      return;
    }
    setSubmitting(true);
    setInviteLinks(null);
    try {
      const res: any = await apiOnline(`/associations/${assocId}/members`, form, "POST");
      setInviteLinks({
        whatsappUrl: res.whatsappUrl,
        smsUrl: res.smsUrl,
        message:
          res.status === "ALREADY_MEMBER"
            ? "Ce membre fait déjà partie de l'association."
            : res.existingAccount
            ? "Compte existant invité à rejoindre l'association."
            : "Invitation envoyée (passage KYC1 dès confirmation).",
      });
      setForm({ lastName: "", firstName: "", country: "", city: "", phone: "", email: "", language: "fr" });
      loadMembers();
    } catch (err: any) {
      showAlert("Erreur", err?.message || "Impossible d'ajouter ce membre (réservé au bureau/fondateur).");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImportContactsFile = async () => {
    if (!assocId) return;
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/vcard", "text/x-vcard", "text/plain", "*/*"],
        copyToCacheDirectory: true,
      });
      if (picked.canceled || !picked.assets?.length) return;
      setSubmitting(true);
      const text = await fetch(picked.assets[0].uri).then((r) => r.text());
      const res: any = await apiOnline(`/associations/${assocId}/members/import`, { content: text }, "POST");
      showAlert(
        "Import terminé",
        `${res.invited || 0} invité(s), ${res.alreadyMembers || 0} déjà membre(s), ${res.errors || 0} erreur(s).`
      );
      loadMembers();
    } catch (err: any) {
      showAlert("Erreur import", err?.message || "Impossible d'importer le fichier.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReferralInvite = async (channel: "EMAIL" | "WHATSAPP") => {
    const emails = refEmails.map((e) => e.trim()).filter(Boolean);
    if (channel === "EMAIL" && emails.length === 0) {
      showAlert("Email requis", "Saisissez au moins une adresse email (jusqu'à 5).");
      return;
    }
    setSubmitting(true);
    try {
      const res: any = await apiOnline("/referrals/invite", { channel, emails }, "POST");
      showAlert(
        "Gamification Tchoua",
        `+${res.pointsAwarded} points gagnés ! Nouveau score : ${res.newScore} pts.`
      );
      if (channel === "EMAIL") setRefEmails(["", "", "", "", ""]);
      if (channel === "WHATSAPP" && res.whatsappUrl) {
        await Linking.openURL(res.whatsappUrl);
      }
    } catch (err: any) {
      showAlert("Erreur", err?.message || "Impossible d'envoyer l'invitation.");
    } finally {
      setSubmitting(false);
    }
  };

  const loadMembers = useCallback(async () => {
    try {
      const selectedId = await getSelectedAssociation();
      if (!selectedId) {
        setMembers([]);
        return;
      }
      setAssocId(selectedId);
      const res = await apiGet<{ members: any[] }>(`/associations/${selectedId}/members`);
      const mapped: MemberItem[] = (res.members ?? []).map((m) => ({
        id: m.id,
        name: m.user?.name || m.user?.email || "Membre",
        role: m.customRole?.name || m.role || "MEMBER",
        score: Math.round(m.reliabilityScore ?? 100),
        status: m.status === "PENDING" ? "En attente" : m.status === "ACTIVE" ? "Actif" : m.status,
        phone: m.user?.phone || "Non renseigné",
      }));
      setMembers(mapped);
    } catch {
      // Keep cached/empty list silently on offline error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.role.toLowerCase().includes(query.toLowerCase())
  );

  const approveMember = async (id: string) => {
    if (!assocId) return;
    try {
      await apiPatch(`/associations/${assocId}/members/${id}`, { status: "ACTIVE" });
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status: "Actif" } : m)));
      showAlert("Membre validé", "Le membre est maintenant actif dans l'association.");
    } catch (err: any) {
      showAlert("Erreur", err?.message || "Impossible de valider ce membre.");
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadMembers();
          }}
        />
      }
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
        <Text style={[styles.title, { color: colors.text }]}>Membres ({members.length})</Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={[
            styles.searchInput,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.lightGray },
          ]}
          placeholder="Rechercher un membre ou rôle..."
          placeholderTextColor={colors.gray}
          value={query}
          onChangeText={setQuery}
        />
        <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
          <TouchableOpacity
            onPress={() => { setInviteLinks(null); setAddOpen(true); }}
            style={[styles.badgeBtn, { flex: 1, backgroundColor: colors.primary, alignItems: "center", paddingVertical: 10 }]}
          >
            <Text style={styles.badgeBtnText}>+ Ajouter / Contacts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDiscoverOpen(true)}
            style={[styles.badgeBtn, { flex: 1, backgroundColor: colors.secondary, alignItems: "center", paddingVertical: 10 }]}
          >
            <Text style={styles.badgeBtnText}>Découvrir (+Pts)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />
      ) : filtered.length === 0 ? (
        <Text style={[styles.empty, { color: colors.gray }]}>
          Aucun membre trouvé pour cette association.
        </Text>
      ) : (
        <View style={styles.list}>
          {filtered.map((m) => (
            <View key={m.id} style={[styles.card, { backgroundColor: colors.surface }]}>
              <View style={[styles.avatar, { backgroundColor: colors.primary + "15" }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>
                  {m.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.text }]}>{m.name}</Text>
                <Text style={[styles.meta, { color: colors.gray }]}>
                  {m.role} · Fiabilité {m.score}%
                </Text>
              </View>
              {m.status === "En attente" ? (
                <TouchableOpacity
                  onPress={() => approveMember(m.id)}
                  style={[styles.badgeBtn, { backgroundColor: colors.secondary }]}
                >
                  <Text style={styles.badgeBtnText}>Valider</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => showAlert(m.name, `Téléphone : ${m.phone}\nRôle : ${m.role}`)}
                  style={[styles.badgeBtn, { backgroundColor: colors.primary + "12" }]}
                >
                  <Text style={[styles.badgeBtnText, { color: colors.primary }]}>Contacter</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}
      <View style={{ height: 80 }} />

      <Modal visible={addOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Ajouter un membre (Bureau / Fondateur)</Text>
            <Text style={[styles.meta, { color: colors.gray, marginBottom: 10 }]}>
              Mobile ou email obligatoire (unique sur la plateforme).
            </Text>

            <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
              <TouchableOpacity
                onPress={() => loadPhoneContacts("member")}
                style={[styles.badgeBtn, { flex: 1, backgroundColor: colors.primary + "18", alignItems: "center", paddingVertical: 9 }]}
              >
                <Text style={[styles.badgeBtnText, { color: colors.primary }]}>Contacts téléphone</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleImportContactsFile}
                style={[styles.badgeBtn, { flex: 1, backgroundColor: colors.primary + "18", alignItems: "center", paddingVertical: 9 }]}
              >
                <Text style={[styles.badgeBtnText, { color: colors.primary }]}>Importer CSV / .vcf</Text>
              </TouchableOpacity>
            </View>

            <TextInput style={[styles.modalInput, { color: colors.text, borderColor: colors.lightGray }]} placeholder="Nom" placeholderTextColor={colors.gray} value={form.lastName} onChangeText={(v) => setForm({ ...form, lastName: v })} />
            <TextInput style={[styles.modalInput, { color: colors.text, borderColor: colors.lightGray }]} placeholder="Prénom" placeholderTextColor={colors.gray} value={form.firstName} onChangeText={(v) => setForm({ ...form, firstName: v })} />
            <TextInput style={[styles.modalInput, { color: colors.text, borderColor: colors.lightGray }]} placeholder="Pays" placeholderTextColor={colors.gray} value={form.country} onChangeText={(v) => setForm({ ...form, country: v })} />
            <TextInput style={[styles.modalInput, { color: colors.text, borderColor: colors.lightGray }]} placeholder="Ville" placeholderTextColor={colors.gray} value={form.city} onChangeText={(v) => setForm({ ...form, city: v })} />
            <TextInput style={[styles.modalInput, { color: colors.text, borderColor: colors.lightGray }]} placeholder="Mobile (+237...)" placeholderTextColor={colors.gray} keyboardType="phone-pad" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} />
            <TextInput style={[styles.modalInput, { color: colors.text, borderColor: colors.lightGray }]} placeholder="Email" placeholderTextColor={colors.gray} keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} />
            <TextInput style={[styles.modalInput, { color: colors.text, borderColor: colors.lightGray }]} placeholder="Langue (fr / en)" placeholderTextColor={colors.gray} value={form.language} onChangeText={(v) => setForm({ ...form, language: v })} />

            {inviteLinks && (
              <View style={{ padding: 10, borderRadius: 12, backgroundColor: "#ECFDF5", marginBottom: 10 }}>
                <Text style={{ color: "#065F46", fontWeight: "700", fontSize: 12 }}>{inviteLinks.message}</Text>
                <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                  {inviteLinks.whatsappUrl ? (
                    <TouchableOpacity onPress={() => Linking.openURL(inviteLinks.whatsappUrl!)} style={[styles.badgeBtn, { backgroundColor: "#16A34A" }]}>
                      <Text style={styles.badgeBtnText}>WhatsApp</Text>
                    </TouchableOpacity>
                  ) : null}
                  {inviteLinks.smsUrl ? (
                    <TouchableOpacity onPress={() => Linking.openURL(inviteLinks.smsUrl!)} style={[styles.badgeBtn, { backgroundColor: "#334155" }]}>
                      <Text style={styles.badgeBtnText}>SMS</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={() => setAddOpen(false)} style={[styles.badgeBtn, { flex: 1, backgroundColor: colors.lightGray, alignItems: "center", paddingVertical: 12 }]}>
                <Text style={[styles.badgeBtnText, { color: colors.text }]}>Fermer</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={submitting} onPress={handleAddMember} style={[styles.badgeBtn, { flex: 1, backgroundColor: colors.primary, alignItems: "center", paddingVertical: 12 }]}>
                <Text style={styles.badgeBtnText}>{submitting ? "Envoi..." : "Ajouter"}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={discoverOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Faire découvrir Tchoua (+Points)</Text>
            <Text style={[styles.meta, { color: colors.gray, marginBottom: 10 }]}>
              Invitez vos contacts à s&apos;inscrire sur le Web ou télécharger l&apos;app mobile et gagnez des points Gamification (+10 pts/email, +15 pts WhatsApp).
            </Text>

            <View style={{ padding: 10, borderRadius: 12, backgroundColor: colors.background, marginBottom: 10 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: colors.text }}>
                Lien d&apos;inscription Web :
              </Text>
              <Text selectable style={{ fontSize: 11, color: colors.primary, marginBottom: 6 }}>
                {refInfo?.shareUrl || "https://www.tchoua.com/register"}
              </Text>
              <Text style={{ fontSize: 11, fontWeight: "700", color: colors.text }}>
                Lien téléchargement App Mobile :
              </Text>
              <Text selectable style={{ fontSize: 11, color: colors.primary }}>
                {refInfo?.mobileDownloadUrl || "https://www.tchoua.com/mobile"}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => loadPhoneContacts("referral")}
              style={[styles.badgeBtn, { backgroundColor: colors.primary + "18", alignItems: "center", paddingVertical: 9, marginBottom: 10 }]}
            >
              <Text style={[styles.badgeBtnText, { color: colors.primary }]}>Remplir depuis contacts téléphone</Text>
            </TouchableOpacity>
            {refEmails.map((val, idx) => (
              <TextInput
                key={idx}
                style={[styles.modalInput, { color: colors.text, borderColor: colors.lightGray }]}
                placeholder={`Email ami ${idx + 1}`}
                placeholderTextColor={colors.gray}
                keyboardType="email-address"
                autoCapitalize="none"
                value={val}
                onChangeText={(v) => {
                  const next = [...refEmails];
                  next[idx] = v;
                  setRefEmails(next);
                }}
              />
            ))}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
              <TouchableOpacity disabled={submitting} onPress={() => handleReferralInvite("EMAIL")} style={[styles.badgeBtn, { flex: 1, backgroundColor: colors.primary, alignItems: "center", paddingVertical: 11 }]}>
                <Text style={styles.badgeBtnText}>Envoyer emails</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={submitting} onPress={() => handleReferralInvite("WHATSAPP")} style={[styles.badgeBtn, { flex: 1, backgroundColor: "#16A34A", alignItems: "center", paddingVertical: 11 }]}>
                <Text style={styles.badgeBtnText}>WhatsApp (+15 pts)</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setDiscoverOpen(false)} style={[styles.badgeBtn, { backgroundColor: colors.lightGray, alignItems: "center", paddingVertical: 11 }]}>
              <Text style={[styles.badgeBtnText, { color: colors.text }]}>Fermer</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={contactPickerMode !== null} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, maxHeight: "80%" }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Sélectionner un contact</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {phoneContacts.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => {
                    if (contactPickerMode === "member") {
                      setForm({
                        ...form,
                        firstName: c.firstName || c.name.split(" ")[0] || "",
                        lastName: c.lastName || c.name.split(" ").slice(1).join(" ") || "",
                        phone: c.phone,
                        email: c.email,
                      });
                    } else if (contactPickerMode === "referral" && c.email) {
                      const emptyIdx = refEmails.findIndex((e) => !e.trim());
                      if (emptyIdx >= 0) {
                        const next = [...refEmails];
                        next[emptyIdx] = c.email;
                        setRefEmails(next);
                      }
                    }
                    setContactPickerMode(null);
                  }}
                  style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.lightGray }}
                >
                  <Text style={{ fontWeight: "700", color: colors.text }}>{c.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.gray }}>{c.phone || ""} {c.email ? `· ${c.email}` : ""}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setContactPickerMode(null)} style={[styles.badgeBtn, { backgroundColor: colors.lightGray, alignItems: "center", paddingVertical: 11, marginTop: 10 }]}>
              <Text style={[styles.badgeBtnText, { color: colors.text }]}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  searchWrap: { padding: SPACING.lg, paddingBottom: SPACING.sm },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
  },
  empty: { textAlign: "center", marginTop: 32, fontSize: 14 },
  list: { paddingHorizontal: SPACING.lg },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  avatarText: { fontSize: 18, fontWeight: "900" },
  name: { fontSize: 15, fontWeight: "800" },
  meta: { fontSize: 12, marginTop: 2 },
  badgeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  badgeBtnText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: SPACING.lg,
  },
  modalCard: {
    borderRadius: 20,
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    marginBottom: 8,
  },
});
