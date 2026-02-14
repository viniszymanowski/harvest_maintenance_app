import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";

interface EnhancedMachineCardProps {
  id: string;
  nome: string;
  modelo?: string;
  hmMotorAtual: number;
  hmTrilhaAtual: number;
  horasTrabalhadas?: number;
  areaColhida?: number;
  operador?: string;
  status?: "working" | "maintenance" | "idle";
  onPress?: () => void;
}

export function EnhancedMachineCard({
  id,
  nome,
  modelo,
  hmMotorAtual,
  hmTrilhaAtual,
  horasTrabalhadas = 0,
  areaColhida = 0,
  operador,
  status = "idle",
  onPress,
}: EnhancedMachineCardProps) {
  const primary = useThemeColor({}, "primary");
  const secondary = useThemeColor({}, "secondary");
  const foreground = useThemeColor({}, "foreground");
  const muted = useThemeColor({}, "muted");

  const getStatusColor = () => {
    switch (status) {
      case "working":
        return "#4A9B3E";
      case "maintenance":
        return "#FFDE00";
      case "idle":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "working":
        return "checkmark-circle";
      case "maintenance":
        return "construct";
      case "idle":
        return "pause-circle";
      default:
        return "pause-circle";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "working":
        return "Trabalhando";
      case "maintenance":
        return "Manutenção";
      case "idle":
        return "Parado";
      default:
        return "Parado";
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.gradient}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.idBadge, { backgroundColor: primary }]}>
              <Text style={styles.idText}>{id}</Text>
            </View>
            <View>
              <Text style={[styles.nome, { color: foreground }]}>{nome}</Text>
              {modelo && (
                <Text style={[styles.modelo, { color: muted }]}>{modelo}</Text>
              )}
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Ionicons
              name={getStatusIcon() as any}
              size={16}
              color="#FFFFFF"
              style={styles.statusIcon}
            />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>

        <View style={styles.horimeters}>
          <View style={styles.horimeterItem}>
            <Ionicons name="speedometer-outline" size={20} color={primary} />
            <View style={styles.horimeterInfo}>
              <Text style={[styles.horimeterLabel, { color: muted }]}>
                HM Motor
              </Text>
              <Text style={[styles.horimeterValue, { color: foreground }]}>
                {hmMotorAtual.toFixed(1)}h
              </Text>
            </View>
          </View>
          <View style={styles.horimeterItem}>
            <Ionicons name="speedometer-outline" size={20} color={secondary} />
            <View style={styles.horimeterInfo}>
              <Text style={[styles.horimeterLabel, { color: muted }]}>
                HM Trilha
              </Text>
              <Text style={[styles.horimeterValue, { color: foreground }]}>
                {hmTrilhaAtual.toFixed(1)}h
              </Text>
            </View>
          </View>
        </View>

        {(horasTrabalhadas > 0 || areaColhida > 0 || operador) && (
          <View style={styles.metrics}>
            {horasTrabalhadas > 0 && (
              <View style={styles.metricItem}>
                <Ionicons name="time-outline" size={16} color={muted} />
                <Text style={[styles.metricText, { color: foreground }]}>
                  {horasTrabalhadas.toFixed(1)}h trabalhadas
                </Text>
              </View>
            )}
            {areaColhida > 0 && (
              <View style={styles.metricItem}>
                <Ionicons name="leaf-outline" size={16} color={muted} />
                <Text style={[styles.metricText, { color: foreground }]}>
                  {areaColhida.toFixed(1)} ha colhidos
                </Text>
              </View>
            )}
            {operador && (
              <View style={styles.metricItem}>
                <Ionicons name="person-outline" size={16} color={muted} />
                <Text style={[styles.metricText, { color: foreground }]}>
                  {operador}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  gradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  idBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  idText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  nome: {
    fontSize: 18,
    fontWeight: "600",
  },
  modelo: {
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusIcon: {
    marginRight: 2,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  horimeters: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  horimeterItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  horimeterInfo: {
    flex: 1,
  },
  horimeterLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  horimeterValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  metrics: {
    gap: 8,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricText: {
    fontSize: 14,
  },
});
