import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Image,
} from "react-native";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { COLORS, SHADOW, SPACING } from "./src/theme";
import { MainTabNavigator } from "./src/navigation/MainTabNavigator";
import { EpargneScreen } from "./src/screens/modules/EpargneScreen";
import { PretsScreen } from "./src/screens/modules/PretsScreen";
import { SolidariteScreen } from "./src/screens/modules/SolidariteScreen";
import { SessionsScreen } from "./src/screens/modules/SessionsScreen";
import { MarketplaceScreen } from "./src/screens/modules/MarketplaceScreen";
import { GamificationScreen } from "./src/screens/modules/GamificationScreen";
import { AcademieScreen } from "./src/screens/modules/AcademieScreen";
import { WalletScreen } from "./src/screens/modules/WalletScreen";
import { CalendarScreen } from "./src/screens/modules/CalendarScreen";
import { HistoriqueScreen } from "./src/screens/modules/HistoriqueScreen";
import { InteretsScreen } from "./src/screens/modules/InteretsScreen";
import { CycleTontineScreen } from "./src/screens/modules/CycleTontineScreen";

const Stack = createStackNavigator();

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("demo@tchoua.cm");
  const [pwd, setPwd] = useState("demo123");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    onLogin();
  };

  const handleSocialLogin = async (provider: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000)); // Simulation Firebase Auth
    setLoading(false);
    onLogin();
  };

  return (
    <View style={styles.loginContainer}>
      <StatusBar barStyle="light-content" />
      <View style={styles.loginHeader}>
        <View style={styles.logoBadge}>
          <Image 
            source={require("./assets/logo.png")} 
            style={{ width: 60, height: 60 }} 
            resizeMode="contain" 
          />
        </View>
        <Text style={styles.brandTitle}>Tchoua</Text>
        <Text style={styles.brandSubtitle}>Solidarité Digitale · 100% Gratuit</Text>
      </View>

      <View style={styles.loginCard}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="votre@email.com"
        />

        <Text style={styles.inputLabel}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          value={pwd}
          onChangeText={setPwd}
          secureTextEntry
          placeholder="••••••••"
        />

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={styles.loginButton}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.loginButtonText}>SE CONNECTER</Text>
          )}
        </TouchableOpacity>

        <View style={styles.socialDivider}>
          <View style={styles.socialLine} />
          <Text style={styles.socialOr}>OU</Text>
          <View style={styles.socialLine} />
        </View>

        <View style={styles.socialContainer}>
          <TouchableOpacity 
            style={[styles.socialButton, { backgroundColor: "#DB4437" }]}
            onPress={() => handleSocialLogin("Google")}
            disabled={loading}
          >
            <Text style={styles.socialButtonText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.socialButton, { backgroundColor: "#4267B2" }]}
            onPress={() => handleSocialLogin("Facebook")}
            disabled={loading}
          >
            <Text style={styles.socialButtonText}>Facebook</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.loginFooter}>
        <Text style={styles.footerText}>
          En vous connectant, vous acceptez nos{" "}
          <Text style={styles.footerLink}>Conditions d'utilisation</Text>
        </Text>
      </View>
    </View>
  );
}

function AppShell() {
  const [loggedIn, setLoggedIn] = useState(false);
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!loggedIn ? (
            <Stack.Screen name="Login">
              {() => <LoginScreen onLogin={() => setLoggedIn(true)} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="Main" component={MainTabNavigator} />
              <Stack.Screen name="epargne" component={EpargneScreen} />
              <Stack.Screen name="prets" component={PretsScreen} />
              <Stack.Screen name="solidarite" component={SolidariteScreen} />
              <Stack.Screen name="sessions" component={SessionsScreen} />
              <Stack.Screen name="marketplace" component={MarketplaceScreen} />
              <Stack.Screen name="gamification" component={GamificationScreen} />
              <Stack.Screen name="academie" component={AcademieScreen} />
              <Stack.Screen name="wallet" component={WalletScreen} />
              <Stack.Screen name="calendar" component={CalendarScreen} />
              <Stack.Screen name="historique" component={HistoriqueScreen} />
              <Stack.Screen name="interets" component={InteretsScreen} />
              <Stack.Screen name="cycle_tontine" component={CycleTontineScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    padding: SPACING.xl,
  },
  loginHeader: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
    ...SHADOW.md,
  },
  logoText: {
    fontSize: 42,
    fontWeight: "900",
    color: COLORS.primary,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: -1,
  },
  brandSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
    marginTop: 4,
  },
  loginCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.xl,
    ...SHADOW.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.gray,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    fontSize: 16,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  loginButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.sm,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 2,
  },
  socialDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SPACING.lg,
  },
  socialLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  socialOr: {
    width: 40,
    textAlign: "center",
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: "bold",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  socialButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: SPACING.xs,
  },
  socialButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 14,
  },
  forgotPassword: {
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  loginFooter: {
    alignItems: "center",
    marginTop: SPACING.xl,
  },
  footerText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    textAlign: "center",
  },
  footerLink: {
    color: COLORS.white,
    fontWeight: "700",
  },
});
