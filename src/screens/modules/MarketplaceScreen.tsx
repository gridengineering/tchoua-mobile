import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiGet, apiPost, getSelectedAssociation } from "../../api/client";
import { COLORS, SHADOW, SPACING } from "../../theme";
import { showAlert } from "../../utils/feedback";

export const MarketplaceScreen = ({ navigation }: any) => {
  const CATEGORIES = ["Tout", "Électronique", "Mode", "Alimentation", "Services"];
  const [selectedCat, setSelectedCat] = useState("Tout");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sellModal, setSellModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const loadListings = useCallback(async () => {
    try {
      const assocId = await getSelectedAssociation();
      const qs = assocId ? `?associationId=${assocId}` : "";
      const res = await apiGet<any[]>(`/marketplace${qs}`);
      setItems(Array.isArray(res) ? res : []);
    } catch {
      // Keep cached
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const filtered = items.filter((item) => {
    const matchCat = selectedCat === "Tout" || item.category === selectedCat;
    const matchSearch = String(item.title || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSell = async () => {
    const priceNum = Number(newPrice.replace(/\s+/g, ""));
    if (!newTitle.trim() || !priceNum || priceNum <= 0) {
      showAlert("Champs requis", "Veuillez renseigner le nom et le prix de l'article.");
      return;
    }
    try {
      const assocId = await getSelectedAssociation();
      await apiPost("/marketplace", {
        title: newTitle.trim(),
        price: priceNum,
        category: selectedCat === "Tout" ? "Services" : selectedCat,
        tontineId: assocId ?? null,
      });
      setNewTitle("");
      setNewPrice("");
      setSellModal(false);
      showAlert("Annonce publiée", "Votre article est maintenant visible sur la Marketplace.");
      loadListings();
    } catch (err: any) {
      showAlert("Erreur", err?.message || "Impossible de publier l'article.");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadListings();
          }}
        />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { flex: 1 }]}>Marketplace</Text>
        <TouchableOpacity style={styles.sellBtn} onPress={() => setSellModal(true)}>
          <Text style={styles.sellBtnText}>+ Vendre</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un produit ou service..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCat(cat)}
            style={[styles.catChip, selectedCat === cat && styles.catChipActive]}
          >
            <Text style={[styles.catText, selectedCat === cat && styles.catTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.list}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 24 }} />
        ) : filtered.length === 0 ? (
          <Text style={styles.empty}>Aucune annonce disponible.</Text>
        ) : (
          filtered.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemMeta}>
                  {item.category || "Général"} · {item.seller?.name || "Membre"}
                </Text>
                <Text style={styles.itemPrice}>
                  {Number(item.price || 0).toLocaleString("fr-FR")} FCFA
                </Text>
              </View>
              <TouchableOpacity
                style={styles.buyBtn}
                onPress={() =>
                  showAlert(
                    item.title,
                    `Vendeur : ${item.seller?.name || "Membre"}\nPrix : ${Number(item.price || 0).toLocaleString("fr-FR")} FCFA`
                  )
                }
              >
                <Text style={styles.buyBtnText}>Voir</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <Modal visible={sellModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Publier un article</Text>
            <TextInput
              style={styles.input}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Nom de l'article"
            />
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={newPrice}
              onChangeText={setNewPrice}
              placeholder="Prix (FCFA)"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setSellModal(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSell} style={styles.confirmBtn}>
                <Text style={styles.confirmText}>Publier</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View style={{ height: 80 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: { marginRight: SPACING.md },
  backText: { fontSize: 16, fontWeight: "700", color: COLORS.primary },
  title: { fontSize: 20, fontWeight: "900", color: COLORS.text },
  sellBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  sellBtnText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  searchWrap: { padding: SPACING.lg, paddingBottom: SPACING.sm },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
  },
  catRow: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  catChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { fontSize: 12, fontWeight: "700", color: COLORS.text },
  catTextActive: { color: "#fff" },
  list: { paddingHorizontal: SPACING.lg },
  empty: { textAlign: "center", color: COLORS.gray, marginTop: 24 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  itemTitle: { fontSize: 15, fontWeight: "800", color: COLORS.text },
  itemMeta: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: "900", color: COLORS.primary, marginTop: 4 },
  buyBtn: { backgroundColor: COLORS.secondary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  buyBtnText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: SPACING.lg },
  modalCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: SPACING.lg },
  modalTitle: { fontSize: 16, fontWeight: "900", color: COLORS.text, marginBottom: SPACING.md },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: SPACING.sm,
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: SPACING.sm },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  cancelText: { color: COLORS.gray, fontWeight: "700" },
  confirmBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  confirmText: { color: "#fff", fontWeight: "800" },
});
