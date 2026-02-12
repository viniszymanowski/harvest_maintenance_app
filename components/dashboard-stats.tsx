import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export function StatCard({
  icon,
  label,
  value,
  unit,
  color,
  trend,
  trendValue,
}: StatCardProps) {
  const foreground = useThemeColor({}, "foreground");
  const muted = useThemeColor({}, "muted");
  const primary = useThemeColor({}, "primary");
  const iconColor = color || primary;

  const getTrendIcon = () => {
    if (trend === "up") return "trending-up";
    if (trend === "down") return "trending-down";
    return "remove";
  };

  const getTrendColor = () => {
    if (trend === "up") return "#4A9B3E";
    if (trend === "down") return "#DC2626";
    return "#6B7280";
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={icon} size={24} color={iconColor} />
        </View>
        {trend && trendValue && (
          <View style={[styles.trendBadge, { backgroundColor: `${getTrendColor()}15` }]}>
            <Ionicons name={getTrendIcon() as any} size={12} color={getTrendColor()} />
            <Text style={[styles.trendText, { color: getTrendColor() }]}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.label, { color: muted }]}>{label}</Text>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color: foreground }]}>{value}</Text>
        {unit && <Text style={[styles.unit, { color: muted }]}>{unit}</Text>}
      </View>
    </View>
  );
}

interface DashboardStatsProps {
  totalMachines: number;
  machinesWorking: number;
  totalHoursToday: number;
  totalAreaToday: number;
  maintenanceAlerts: number;
}

export function DashboardStats({
  totalMachines,
  machinesWorking,
  totalHoursToday,
  totalAreaToday,
  maintenanceAlerts,
}: DashboardStatsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.col}>
          <StatCard
            icon="hardware-chip-outline"
            label="Máquinas Ativas"
            value={`${machinesWorking}/${totalMachines}`}
            color="#4A9B3E"
          />
        </View>
        <View style={styles.col}>
          <StatCard
            icon="time-outline"
            label="Horas Hoje"
            value={totalHoursToday.toFixed(1)}
            unit="h"
            color="#FFDE00"
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.col}>
          <StatCard
            icon="leaf-outline"
            label="Área Colhida Hoje"
            value={totalAreaToday.toFixed(1)}
            unit="ha"
            color="#367C2B"
          />
        </View>
        <View style={styles.col}>
          <StatCard
            icon="warning-outline"
            label="Alertas Manutenção"
            value={maintenanceAlerts}
            color={maintenanceAlerts > 0 ? "#DC2626" : "#6B7280"}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  col: {
    flex: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendText: {
    fontSize: 11,
    fontWeight: "600",
  },
  label: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: "700",
  },
  unit: {
    fontSize: 16,
    fontWeight: "500",
  },
});
