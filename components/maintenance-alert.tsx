import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";

interface MaintenanceAlertProps {
  maquinaId: string;
  maquinaNome: string;
  tipo: "troca_oleo" | "revisao_50h" | "geral";
  hmAtual: number;
  hmProxima: number;
  urgencia: "alta" | "media" | "baixa";
  onPress?: () => void;
}

export function MaintenanceAlert({
  maquinaId,
  maquinaNome,
  tipo,
  hmAtual,
  hmProxima,
  urgencia,
  onPress,
}: MaintenanceAlertProps) {
  const foreground = useThemeColor({}, "foreground");
  const muted = useThemeColor({}, "muted");

  const getUrgenciaColor = () => {
    switch (urgencia) {
      case "alta":
        return "#DC2626";
      case "media":
        return "#FFDE00";
      case "baixa":
        return "#4A9B3E";
      default:
        return "#6B7280";
    }
  };

  const getUrgenciaText = () => {
    switch (urgencia) {
      case "alta":
        return "URGENTE";
      case "media":
        return "EM BREVE";
      case "baixa":
        return "PLANEJADA";
      default:
        return "";
    }
  };

  const getTipoText = () => {
    switch (tipo) {
      case "troca_oleo":
        return "Troca de Óleo";
      case "revisao_50h":
        return "Revisão 50h";
      case "geral":
        return "Manutenção Geral";
      default:
        return "Manutenção";
    }
  };

  const getTipoIcon = () => {
    switch (tipo) {
      case "troca_oleo":
        return "water-outline";
      case "revisao_50h":
        return "construct-outline";
      case "geral":
        return "build-outline";
      default:
        return "build-outline";
    }
  };

  const horasRestantes = hmProxima - hmAtual;
  const porcentagem = Math.max(0, Math.min(100, (horasRestantes / 50) * 100));

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { borderLeftColor: getUrgenciaColor() },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${getUrgenciaColor()}15` }]}>
            <Ionicons name={getTipoIcon() as any} size={20} color={getUrgenciaColor()} />
          </View>
          <View>
            <Text style={[styles.maquinaNome, { color: foreground }]}>
              {maquinaId} - {maquinaNome}
            </Text>
            <Text style={[styles.tipoText, { color: muted }]}>{getTipoText()}</Text>
          </View>
        </View>
        <View style={[styles.urgenciaBadge, { backgroundColor: getUrgenciaColor() }]}>
          <Text style={styles.urgenciaText}>{getUrgenciaText()}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${porcentagem}%`,
                backgroundColor: getUrgenciaColor(),
              },
            ]}
          />
        </View>
        <Text style={[styles.horasText, { color: muted }]}>
          {horasRestantes.toFixed(1)}h restantes
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="speedometer-outline" size={14} color={muted} />
          <Text style={[styles.footerText, { color: muted }]}>
            HM Atual: {hmAtual.toFixed(1)}h
          </Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="flag-outline" size={14} color={muted} />
          <Text style={[styles.footerText, { color: muted }]}>
            Próxima: {hmProxima.toFixed(1)}h
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {
    opacity: 0.8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  maquinaNome: {
    fontSize: 15,
    fontWeight: "600",
  },
  tipoText: {
    fontSize: 13,
    marginTop: 2,
  },
  urgenciaBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgenciaText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  horasText: {
    fontSize: 12,
    textAlign: "right",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 12,
  },
});
