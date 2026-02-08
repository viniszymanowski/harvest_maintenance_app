import { ScrollView, Text, View, Switch, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useColors } from "@/hooks/use-colors";

export default function NotificacoesScreen() {
  const colors = useColors();
  const utils = trpc.useUtils();

  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  const updateMutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      Alert.alert("Sucesso", "Configurações salvas com sucesso!");
    },
    onError: (error) => {
      Alert.alert("Erro", error.message);
    },
  });

  const [emailDestinatario, setEmailDestinatario] = useState("");
  const [envioEmailAtivo, setEnvioEmailAtivo] = useState(false);
  const [horarioEnvioEmail, setHorarioEnvioEmail] = useState("18:00");
  const [whatsappNumero, setWhatsappNumero] = useState("");
  const [envioWhatsappAtivo, setEnvioWhatsappAtivo] = useState(false);
  const [horarioEnvioWhatsapp, setHorarioEnvioWhatsapp] = useState("18:00");

  useEffect(() => {
    if (settings) {
      setEmailDestinatario(settings.emailDestinatario || "");
      setEnvioEmailAtivo(settings.envioEmailAtivo || false);
      setHorarioEnvioEmail(settings.horarioEnvioEmail || "18:00");
      setWhatsappNumero(settings.whatsappNumero || "");
      setEnvioWhatsappAtivo(settings.envioWhatsappAtivo || false);
      setHorarioEnvioWhatsapp(settings.horarioEnvioWhatsapp || "18:00");
    }
  }, [settings]);

  const handleSave = () => {
    updateMutation.mutate({
      emailDestinatario,
      envioEmailAtivo,
      horarioEnvioEmail,
      whatsappNumero,
      envioWhatsappAtivo,
      horarioEnvioWhatsapp,
    });
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted">Carregando...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-4">
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Notificações</Text>
          <Text className="text-sm text-muted mt-1">
            Configure envio automático de relatórios
          </Text>
        </View>

        {/* Seção Email */}
        <View className="bg-surface rounded-2xl p-5 mb-4 border border-border">
          <Text className="text-xl font-bold text-foreground mb-4">📧 Email</Text>

          <Input
            label="Email Destinatário"
            value={emailDestinatario}
            onChangeText={setEmailDestinatario}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            required
          />

          <View className="flex-row items-center justify-between mt-4">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground">Envio Automático</Text>
              <Text className="text-xs text-muted mt-1">
                Receba relatório diário por email
              </Text>
            </View>
            <Switch
              value={envioEmailAtivo}
              onValueChange={setEnvioEmailAtivo}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <Input
            label="Horário de Envio"
            value={horarioEnvioEmail}
            onChangeText={setHorarioEnvioEmail}
            placeholder="18:00"
            className="mt-4"
          />
        </View>

        {/* Seção WhatsApp */}
        <View className="bg-surface rounded-2xl p-5 mb-4 border border-border">
          <Text className="text-xl font-bold text-foreground mb-4">💬 WhatsApp</Text>

          <Input
            label="Número WhatsApp"
            value={whatsappNumero}
            onChangeText={setWhatsappNumero}
            placeholder="+55 11 99999-9999"
            keyboardType="phone-pad"
            required
          />

          <View className="flex-row items-center justify-between mt-4">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground">Envio Automático</Text>
              <Text className="text-xs text-muted mt-1">
                Receba relatório diário no WhatsApp
              </Text>
            </View>
            <Switch
              value={envioWhatsappAtivo}
              onValueChange={setEnvioWhatsappAtivo}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <Input
            label="Horário de Envio"
            value={horarioEnvioWhatsapp}
            onChangeText={setHorarioEnvioWhatsapp}
            placeholder="18:00"
            className="mt-4"
          />

          <View className="bg-warning/10 p-3 rounded-lg mt-4">
            <Text className="text-xs text-foreground">
              ℹ️ <Text className="font-semibold">Importante:</Text> O envio via WhatsApp requer
              configuração adicional da API do Twilio. Entre em contato para ativar.
            </Text>
          </View>
        </View>

        {/* Botões */}
        <View className="gap-3 mb-8">
          <Button
            title="Salvar Configurações"
            onPress={handleSave}
            loading={updateMutation.isPending}
            variant="primary"
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
