import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Modal,
} from "react-native";
import { COLORS, SPACING, SHADOW } from "../../theme";
import { showAlert } from "../../utils/feedback";

const { width } = Dimensions.get("window");

const INITIAL_ITEMS = [
  { id: "1", title: "Sac à main cuir", cat: "Mode", priceNum: 15000, seller: "Amina K.", time: "2h", image: "👜" },
  { id: "2", title: "Panier Fruits Frais", cat: "Alimentation", priceNum: 5000, seller: "Bio Garden", time: "5h", image: "🍎" },
  { id: "3", title: "iPhone 12 Pro", cat: "Électronique", priceNum: 350000, seller: "Tech Store", time: "1j", image: "📱" },
  { id: "4", title: "Tee-shirt Coton", cat: "Mode", priceNum: 3500, seller: "Moda Fashion", time: "2j", image: "👕" },
];

export const MarketplaceScreen = ({ navigation }: any) => {
  const CATEGORIES = ["Tout", "Électronique", "Mode", "Alimentation", "Services"];
  const [selectedCat, setSelectedCat] = useState("Tout");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [cart, setCart] = useState<typeof INITIAL_ITEMS>([]);
  const [cartModal, setCartModal] = useState(false);
  const [sellModal, setSellModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const filtered = items.filter((item) => {
    const matchCat = selectedCat === "Tout" || item.cat === selectedCat;
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (item: (typeof INITIAL_ITEMS)[0]) => {
    setCart((prev) => [...prev, item]);
    showAlert("Ajouté au panier", `"${item.title}" a été ajouté à votre panier.`);
  };

  const handleSell = () => {
    const priceNum = Number(newPrice.replace(/\s+/g, ""));
    if (!newTitle.trim() || !priceNum || priceNum <= 0) {
      showAlert("Champs requis", "Veuillez renseigner le nom et le prix de l'article.");
      return;
    }
    setItems((prev) => [
      {
        id: String(Date.now()),
        title: newTitle.trim(),
        cat: selectedCat === "Tout" ? "Services" : selectedCat,
        priceNum,
        seller: "Moi",
        time: "À l'instant",
        image: "🏷️",
      },
      ...prev,
    ]);
    setNewTitle("");
    setNewPrice("");
    setSellModal(false);
    showAlert("Annonce publiée", "Votre article est maintenant visible sur la Marketplace.");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Marketplace</Text>
          <TouchableOpacity style={styles.cartBtn} onPress={() => setCartModal(true)}>
            <Text style={{ fontSize: 18 }}>🛒 {cart.length > 0 ? `(${cart.length})` : ""}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES.map((cat, i) => {
            const active = selectedCat === cat;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedCat(cat)}
                style={[styles.catBadge, active && styles.catBadgeActive]}
              >
                <Text style={[styles.catText, active && styles.catTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {filtered.map((item) => (
            <TouchableOpacity key={item.id} style={styles.productCard} onPress={() => addToCart(item)}>
              <View style={styles.productImage}>
                <Text style={{ fontSize: 64 }}>{item.image}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.productPrice}>{item.priceNum.toLocaleString("fr-FR")} F</Text>
                <View style={styles.productFooter}>
                  <Text style={styles.productSeller}>{item.seller}</Text>
                  <Text style={styles.productTime}>{item.time}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      <TouchableOpacity style={styles.sellFab} onPress={() => setSellModal(true)}>
        <Text style={styles.sellFabIcon}>📸</Text>
        <Text style={styles.sellFabText}>VENDRE</Text>
      </TouchableOpacity>

      <Modal visible={cartModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: SPACING.lg }}>
          <View style={{ backgroundColor: COLORS.white, borderRadius: 20, padding: SPACING.lg }}>
            <Text style={{ fontSize: 18, fontWeight: "900", color: COLORS.primary, marginBottom: SPACING.md }}>
              Mon Panier ({cart.length})
            </Text>
            {cart.length === 0 ? (
              <Text style={{ color: COLORS.gray, marginBottom: SPACING.md }}>Votre panier est vide.</Text>
            ) : (
              <>
                {cart.map((c, idx) => (
                  <View key={idx} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}>
                    <Text style={{ fontWeight: "700" }}>{c.title}</Text>
                    <Text style={{ fontWeight: "800", color: COLORS.primary }}>{c.priceNum.toLocaleString("fr-FR")} F</Text>
                  </View>
                ))}
                <Text style={{ marginTop: SPACING.sm, fontWeight: "900", fontSize: 16 }}>
                  Total : {cart.reduce((s, c) => s + c.priceNum, 0).toLocaleString("fr-FR")} F
                </Text>
              </>
            )}
            <View style={{ flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.md }}>
              <TouchableOpacity
                onPress={() => setCartModal(false)}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: COLORS.lightGray, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "700" }}>Fermer</Text>
              </TouchableOpacity>
              {cart.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setCart([]);
                    setCartModal(false);
                    showAlert("Commande validée", "Votre commande a été transmise aux vendeurs.");
                  }}
                  style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: "center" }}
                >
                  <Text style={{ fontWeight: "800", color: COLORS.white }}>Commander</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={sellModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: SPACING.lg }}>
          <View style={{ backgroundColor: COLORS.white, borderRadius: 20, padding: SPACING.lg }}>
            <Text style={{ fontSize: 18, fontWeight: "900", color: COLORS.primary, marginBottom: SPACING.md }}>
              Publier un article
            </Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 12, padding: 12, marginBottom: SPACING.sm }}
              placeholder="Nom de l'article"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={{ borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 12, padding: 12, marginBottom: SPACING.md }}
              placeholder="Prix (FCFA)"
              keyboardType="numeric"
              value={newPrice}
              onChangeText={setNewPrice}
            />
            <View style={{ flexDirection: "row", gap: SPACING.sm }}>
              <TouchableOpacity
                onPress={() => setSellModal(false)}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: COLORS.lightGray, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "700" }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSell}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: COLORS.secondary, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "800", color: COLORS.white }}>Publier</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    height: 60,
  },
  backText: {
    fontSize: 32,
    color: COLORS.primary,
    fontWeight: "300",
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.primary,
  },
  cartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    marginHorizontal: SPACING.lg,
    paddingHorizontal: 12,
    borderRadius: 16,
    height: 44,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.black,
  },
  catScroll: {
    paddingLeft: SPACING.lg,
    paddingBottom: 16,
  },
  catBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  catBadgeActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.gray,
  },
  catTextActive: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  productCard: {
    width: (width - SPACING.md * 2 - 12) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    overflow: "hidden",
    ...SHADOW.sm,
  },
  productImage: {
    height: 140,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.secondary,
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productSeller: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.gray,
  },
  productTime: {
    fontSize: 9,
    color: COLORS.lightGray,
  },
  sellFab: {
    position: "absolute",
    bottom: 100,
    right: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    ...SHADOW.md,
  },
  sellFabIcon: {
    fontSize: 20,
  },
  sellFabText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 1,
  },
});
