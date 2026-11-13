import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { SHADOW } from "../theme";
import { PlusMenu } from "../components/PlusMenu";

import { HomeScreen } from "../screens/HomeScreen";
import { TontinesScreen } from "../screens/TontinesScreen";
import { ChatScreen } from "../screens/ChatScreen";
import { ProfileScreen } from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({ onPress, color }: any) => (
  <TouchableOpacity
    style={{
      top: -20,
      justifyContent: "center",
      alignItems: "center",
      ...SHADOW.md,
    }}
    onPress={onPress}
  >
    <View
      style={{
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: color,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 30, color: "#ffffff", fontWeight: "bold" }}>+</Text>
    </View>
  </TouchableOpacity>
);

export const MainTabNavigator = ({ navigation }: any) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const { colors } = useTheme();

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarShowLabel: true,
          tabBarStyle: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 0,
            backgroundColor: colors.surface,
            height: 80,
            paddingBottom: 20,
            borderTopWidth: 1,
            borderTopColor: colors.lightGray,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.gray,
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Accueil"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>📊</Text>,
          }}
        />
        <Tab.Screen
          name="Tontines"
          component={TontinesScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>💰</Text>,
          }}
        />
        <Tab.Screen
          name="Actions"
          component={View}
          options={{
            tabBarButton: (props) => (
              <CustomTabBarButton {...props} color={colors.secondary} onPress={() => setMenuVisible(true)} />
            ),
          }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>💬</Text>,
          }}
        />
        <Tab.Screen
          name="Profil"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>👤</Text>,
          }}
        />
      </Tab.Navigator>

      <PlusMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onNavigate={(route) => navigation.navigate(route)}
      />
    </>
  );
};
