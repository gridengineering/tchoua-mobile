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
import { Modal } from "react-native";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { showAlert } from "./src/utils/feedback";
import { MembresScreen } from "./src/screens/modules/MembresScreen";
import { EvenementsScreen } from "./src/screens/modules/EvenementsScreen";
import { ConseilsIAScreen } from "./src/screens/modules/ConseilsIAScreen";
import { RapportsScreen } from "./src/screens/modules/RapportsScreen";
import { CreateAssociationScreen } from "./src/screens/modules/CreateAssociationScreen";
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

function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetVisible, setResetVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    const res = await login(email, pwd);
    setLoading(false);
    if (!res.ok && res.error) {
      setErrorMsg(res.error);
      showAlert("Connexion www.tchoua.com", res.error);
    }
  };

  const handleSocialLogin = (provider: string) => {
    showAlert(
      `Connexion ${provider}`,
      "Veuillez vous connecter avec vos identifiants www.tchoua.com (email et mot de passe)."
    );
  };

  const handleResetPassword = () => {
    if (!resetEmail.trim()) {
      showAlert("Email requis", "Veuillez saisir votre adresse email.");
      return;
    }
    setResetVisible(false);
    showAlert(
      "Lien envoyé",
      `Un email de réinitialisation a été envoyé à ${resetEmail.trim()}.`
    );
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
        <Text style={styles.brandSubtitle}>Connecté à www.tchoua.com</Text>
      </View>

      <View style={styles.loginCard}>
        {errorMsg ? (
          <Text style={{ color: COLORS.danger, fontSize: 12, fontWeight: "700", marginBottom: SPACING.sm }}>
            {errorMsg}
          </Text>
        ) : null}
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

        <TouchableOpacity style={styles.forgotPassword} onPress={() => setResetVisible(true)}>
          <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.loginFooter}>
        <Text style={styles.footerText}>
          En vous connectant, vous acceptez nos{" "}
          <Text
            style={styles.footerLink}
            onPress={() =>
              showAlert(
                "Conditions d'utilisation",
                "Tchoua est une plateforme open-source et gratuite de gestion d'associations et de tontines. Vos données restent strictement confidentielles au sein de vos associations."
              )
            }
          >
            Conditions d&apos;utilisation
          </Text>
        </Text>
      </View>

      <Modal visible={resetVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: SPACING.lg }}>
          <View style={{ backgroundColor: COLORS.white, borderRadius: 20, padding: SPACING.lg }}>
            <Text style={{ fontSize: 18, fontWeight: "900", color: COLORS.primary, marginBottom: SPACING.sm }}>
              Réinitialiser le mot de passe
            </Text>
            <TextInput
              style={styles.input}
              value={resetEmail}
              onChangeText={setResetEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="votre@email.com"
            />
            <View style={{ flexDirection: "row", gap: SPACING.sm }}>
              <TouchableOpacity
                onPress={() => setResetVisible(false)}
                style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: COLORS.lightGray, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "700", color: COLORS.black }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleResetPassword}
                style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "800", color: COLORS.white }}>Envoyer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function AppShell() {
  const { loggedIn, checking } = useAuth();
  const { colors } = useTheme();

  if (checking) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.white} />
        <Text style={{ color: COLORS.white, marginTop: 12, fontWeight: "700" }}>
          Connexion à www.tchoua.com...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!loggedIn ? (
            <Stack.Screen name="Login" component={LoginScreen} />
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
              <Stack.Screen name="membres" component={MembresScreen} />
              <Stack.Screen name="evenements" component={EvenementsScreen} />
              <Stack.Screen name="conseils" component={ConseilsIAScreen} />
              <Stack.Screen name="rapports" component={RapportsScreen} />
              <Stack.Screen name="create_assoc" component={CreateAssociationScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </AuthProvider>
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
