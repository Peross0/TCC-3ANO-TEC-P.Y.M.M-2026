import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Redirect, Tabs } from "expo-router";
import { useContext } from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppPreferences } from "../../context/PreferencesContext";
import { SessionContext } from "../../context/SessionContext";

function blurFocusedWebElement() {
  if (Platform.OS === "web" && typeof document !== "undefined") {
    document.activeElement?.blur?.();
  }
}

export default function TabLayout() {
  const { colors } = useAppPreferences();
  const { sessionData } = useContext(SessionContext);
  const insets = useSafeAreaInsets();

  if (!sessionData?.user) return <Redirect href="/" />;

  return (
    <Tabs
      screenListeners={{
        blur: blurFocusedWebElement,
      }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.muted,
        // Remove os rótulos de texto de todas as abas globalmente
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          height: Math.max(64, 50 + insets.bottom),
          paddingBottom: Math.max(10, insets.bottom),
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Início",
          tabBarAccessibilityLabel: "Início, oportunidades",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index1"
        options={{
          title: "Mensagens",
          tabBarAccessibilityLabel: "Mensagens e conversas",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="mail" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index2"
        options={{
          title: "Empresas",
          href: sessionData.user.user_type === "CANDIDATE" ? undefined : null,
          tabBarAccessibilityLabel: "Empresas de interesse",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="business" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index3"
        options={{
          title: "Perfil",
          tabBarAccessibilityLabel: "Perfil e documentos",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
