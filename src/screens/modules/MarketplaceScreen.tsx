import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Image,
} from "react-native";
import { COLORS, SPACING, SHADOW } from "../../theme";

const { width } = Dimensions.get("window");

export const MarketplaceScreen = ({ navigation }: any) => {
  const CATEGORIES = ["Tout", "Électronique", "Mode", "Alimentation", "Services"];
  const ITEMS = [
    { title: "Sac à main cuir", price: "15 000 F", seller: "Amina K.", time: "2h ago", image: "👜" },
    { title: "Panier Fruits Frais", price: "5 000 F", seller: "Bio Garden", time: "5h ago", image: "🍎" },
    { title: "iPhone 12 Pro", price: "350 000 F", seller: "Tech Store", time: "1d ago", image: "📱" },
    { title: "Tee-shirt Coton", price: "3 500 F", seller: "Moda Fashion", time: "2d ago", image: "👕" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Marketplace</Text>
          <TouchableOpacity style={styles.cartBtn}>
            <Text style={{ fontSize: 20 }}>🛒</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput style={styles.searchInput} placeholder="Rechercher un produit..." />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES.map((cat, i) => (
            <TouchableOpacity key={i} style={[styles.catBadge, i === 0 && styles.catBadgeActive]}>
              <Text style={[styles.catText, i === 0 && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {ITEMS.map((item, i) => (
            <TouchableOpacity key={i} style={styles.productCard}>
              <View style={styles.productImage}>
                <Text style={{ fontSize: 64 }}>{item.image}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.productPrice}>{item.price}</Text>
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

      <TouchableOpacity style={styles.sellFab}>
        <Text style={styles.sellFabIcon}>📸</Text>
        <Text style={styles.sellFabText}>VENDRE</Text>
      </TouchableOpacity>
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
