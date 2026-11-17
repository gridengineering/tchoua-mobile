import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, TouchableOpacity } from "react-native";
import { apiGet, getSelectedAssociation, subscribeSelectedAssociation } from "../api/client";
import { useTheme } from "../context/ThemeContext";
import { PlusMenu } from "../components/PlusMenu";

import { HomeScreen } from "../screens/HomeScreen";
import { TontinesScreen } from "../screens/TontinesScreen";
import { ChatScreen } from "../screens/ChatScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { WalletScreen } from "../screens/modules/WalletScreen";
import { SessionsScreen } from "../screens/modules/SessionsScreen";

const Tab = createBottomTabNavigator();

export const MainTabNavigator = ({ navigation }: any) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedAssocId, setSelectedAssocId] = useState<string | null>(null);
  const [assocRole, setAssocRole] = useState<string | null>(null);
  const { colors } = useTheme();

  useEffect(() => {
    getSelectedAssociation().then(setSelectedAssocId).catch(() => {});
    return subscribeSelectedAssociation(setSelectedAssocId);
  }, []);

  useEffect(() => {
    if (!selectedAssocId) { setAssocRole(null); return; }
    apiGet<{ associations?: any[] }>("/associations")
      .then((data) => setAssocRole(data.associations?.find((a) => a.id === selectedAssocId)?.myRole ?? null))
      .catch(() => setAssocRole(null));
  }, [selectedAssocId]);

  const inAssoc = Boolean(selectedAssocId);

  return (
    <>
      <Tab.Navigator
        key={inAssoc ? "assoc-tabs" : "global-tabs"}
        initialRouteName="Accueil"
        screenOptions={{
          tabBarShowLabel: true,
          tabBarStyle: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 0,
            backgroundColor: colors.surface,
            height: 76,
            paddingBottom: 14,
            borderTopWidth: 1,
            borderTopColor: colors.lightGray,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.gray,
          headerShown: false,
        }}
      >
        {inAssoc ? (
          <>
            <Tab.Screen
              name="Accueil"
              component={HomeScreen}
              options={{
                tabBarLabel: "Ma situation",
                tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📊</Text>,
              }}
            />
            <Tab.Screen
              name="Tontines"
              component={TontinesScreen}
              options={{
                tabBarLabel: "Activités",
                tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>💰</Text>,
              }}
            />
            <Tab.Screen
              name="Sessions"
              component={SessionsScreen}
              options={{
                tabBarLabel: "Réunions",
                tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📅</Text>,
              }}
            />
            <Tab.Screen
              name="Chat"
              component={ChatScreen}
              options={{
                tabBarLabel: "Chat",
                tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>💬</Text>,
              }}
            />
            <Tab.Screen
              name="Plus"
              component={View}
              options={{
                tabBarLabel: "Plus",
                tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>☰</Text>,
                tabBarButton: (props) => (
                  <TouchableOpacity
                    {...(props as any)}
                    onPress={() => setMenuVisible(true)}
                    style={[props.style, { alignItems: "center", justifyContent: "center" }]}
                  />
                ),
              }}
            />
          </>
        ) : (
          <>
            <Tab.Screen
              name="Accueil"
              component={HomeScreen}
              options={{
                tabBarLabel: "Accueil",
                tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text>,
              }}
            />
            <Tab.Screen
              name="Tontines"
              component={TontinesScreen}
              options={{
                tabBarLabel: "Associations",
                tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🤝</Text>,
              }}
            />
            <Tab.Screen
              name="Portefeuille"
              component={WalletScreen}
              options={{
                tabBarLabel: "Portefeuille",
                tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👛</Text>,
              }}
            />
            <Tab.Screen
              name="Profil"
              component={ProfileScreen}
              options={{
                tabBarLabel: "Profil",
                tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text>,
              }}
            />
            <Tab.Screen
              name="Plus"
              component={View}
              options={{
                tabBarLabel: "Plus",
                tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>☰</Text>,
                tabBarButton: (props) => (
                  <TouchableOpacity
                    {...(props as any)}
                    onPress={() => setMenuVisible(true)}
                    style={[props.style, { alignItems: "center", justifyContent: "center" }]}
                  />
                ),
              }}
            />
          </>
        )}
      </Tab.Navigator>

      <PlusMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        associationRole={assocRole}
        inAssociation={inAssoc}
        onNavigate={(route) => {
          if (route === "versement") {
            navigation.navigate("Main", { screen: "Tontines", params: { openPayModal: Date.now() } });
          } else if (route === "aide") {
            navigation.navigate("solidarite", { openAidModal: Date.now() });
          } else if (route === "pret_req") {
            navigation.navigate("prets", { openLoanModal: Date.now() });
          } else {
            navigation.navigate(route);
          }
        }}
      />
    </>
  );
};
