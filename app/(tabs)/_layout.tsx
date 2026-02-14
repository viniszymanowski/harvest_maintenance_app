import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, View, Text, useWindowDimensions } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

// (opcional) se você tiver como buscar contagem real depois, troque aqui:
const NOTIFICATION_BADGE_COUNT = 0;

function TabIcon({
  name,
  color,
  focused,
  badgeCount,
}: {
  name: string;
  color: string;
  focused: boolean;
  badgeCount?: number;
}) {
  return (
    <View className="items-center justify-center">
      {/* “bolha” atrás do ícone quando ativo */}
      <View
        className={`items-center justify-center rounded-2xl ${
          focused ? "bg-primary/15" : "bg-transparent"
        }`}
        style={{
          width: 44,
          height: 36,
        }}
      >
        <IconSymbol size={24} name={name as any} color={color} />
      </View>

      {/* badge */}
      {!!badgeCount && badgeCount > 0 && (
        <View
          className="absolute -top-1 -right-2 bg-error items-center justify-center"
          style={{
            minWidth: 18,
            height: 18,
            borderRadius: 999,
            paddingHorizontal: 5,
          }}
        >
          <Text className="text-[11px] font-extrabold text-white">
            {badgeCount > 99 ? "99+" : badgeCount}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;

  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 10);
  const tabBarHeight = 64 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,

        tabBarActiveTintColor: colors.primary ?? colors.tint,
        tabBarInactiveTintColor: colors.muted,

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "800",
          marginTop: 2,
        },

        tabBarStyle: isDesktop
          ? {
              // Sidebar premium (desktop/web)
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 260,
              height: "100%",
              flexDirection: "column",
              paddingTop: 18,
              paddingBottom: 18,
              backgroundColor: colors.surface,
              borderRightColor: colors.border,
              borderRightWidth: 1,
              borderTopWidth: 0,
            }
          : {
              // Tab bar premium (mobile)
              position: "absolute",
              left: 12,
              right: 12,
              bottom: 10,
              height: tabBarHeight,
              paddingTop: 10,
              paddingBottom: bottomPadding,
              backgroundColor: colors.surface, // <- surface dá “cara de app”
              borderTopWidth: 0,

              // arredondado + sombra
              borderRadius: 22,

              // iOS shadow
              shadowColor: "#000",
              shadowOpacity: 0.12,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 10 },

              // Android shadow
              elevation: 18,
            },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="house.fill" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="lancamento"
        options={{
          title: "Novo",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="plus.circle.fill" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="registros"
        options={{
          title: "Registros",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="list.bullet" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="manutencao"
        options={{
          title: "Manut.",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="wrench.fill" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="relatorios"
        options={{
          title: "Dados",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="chart.bar.fill" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="notificacoes"
        options={{
          title: "Alertas",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="bell.fill"
              color={color}
              focused={focused}
              badgeCount={NOTIFICATION_BADGE_COUNT}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="configuracoes"
        options={{
          title: "Config",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="gear" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
