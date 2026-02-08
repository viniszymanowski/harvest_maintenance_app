import { ScrollView, Text, View, TouchableOpacity, Platform } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export default function RelatoriosScreen() {
  const [tipoRelatorio, setTipoRelatorio] = useState<"diario" | "maquina" | "operador" | "manutencao">("diario");
  const [periodo, setPeriodo] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  // Buscar relatório diário
  const dailyReport = trpc.reports.daily.useQuery(
    { date: periodo.to },
    { enabled: tipoRelatorio === "diario" }
  );

  // Buscar relatório de operadores
  const operatorsReport = trpc.reports.operators.useQuery(
    { from: periodo.from, to: periodo.to },
    { enabled: tipoRelatorio === "operador" }
  );

  // Buscar relatório de manutenções
  const maintenanceReport = trpc.reports.maintenance.useQuery(
    { from: periodo.from, to: periodo.to },
    { enabled: tipoRelatorio === "manutencao" }
  );

  const generatePDFMutation = trpc.reports.generatePDF.useMutation();

  const handleExportPDF = async () => {
    try {
      let type: "daily" | "operators" | "maintenance";
      let date: string | undefined;
      let from: string | undefined;
      let to: string | undefined;

      if (tipoRelatorio === "diario") {
        type = "daily";
        date = periodo.to;
      } else if (tipoRelatorio === "operador") {
        type = "operators";
        from = periodo.from;
        to = periodo.to;
      } else if (tipoRelatorio === "manutencao") {
        type = "maintenance";
        from = periodo.from;
        to = periodo.to;
      } else {
        alert("Tipo de relatório inválido");
        return;
      }

      // Chamar mutation tRPC para gerar PDF
      const result = await generatePDFMutation.mutateAsync({ type, date, from, to });

      // Salvar arquivo
      const fileUri = FileSystem.documentDirectory + result.filename;
      await FileSystem.writeAsStringAsync(fileUri, result.buffer, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Compartilhar
      if (Platform.OS === "web") {
        // Download no navegador
        const blob = new Blob([Buffer.from(result.buffer, "base64")], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Compartilhar no mobile
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/pdf",
          dialogTitle: "Exportar Relatório PDF",
        });
      }
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Erro ao exportar PDF. Tente novamente.");
    }
  };

  const handleExportCSV = async () => {
    let data: any[] = [];
    let filename = "";

    if (tipoRelatorio === "diario" && dailyReport.data) {
      data = dailyReport.data.logs.map((log: any) => ({
        Maquina: log.maquinaId,
        Operador: log.operador || "-",
        "Chegada Lavoura": log.chegadaLavoura || "-",
        "Saída Lavoura": log.saidaLavoura || "-",
        "Horas Motor": log.horasMotorDia?.toFixed(1) || "0.0",
        "Horas Prod": log.prodH?.toFixed(1) || "0.0",
        "Área (ha)": log.areaHa?.toFixed(2) || "0.00",
        Divergente: log.divergente ? "Sim" : "Não",
      }));
      filename = `relatorio_diario_${periodo.to}.csv`;
    } else if (tipoRelatorio === "operador" && operatorsReport.data) {
      data = operatorsReport.data.map((op: any) => ({
        Operador: op.operador,
        "Total Dias": op.totalDias,
        "Total Horas Motor": op.totalHorasMotor.toFixed(1),
        "Total Horas Prod": op.totalHorasProd.toFixed(1),
        "Total Área (ha)": op.totalArea.toFixed(2),
        "Produtividade Média (ha/h)": op.produtividadeMedia.toFixed(2),
        "Taxa Divergência (%)": op.taxaDivergencia.toFixed(1),
      }));
      filename = `relatorio_operadores_${periodo.from}_${periodo.to}.csv`;
    } else if (tipoRelatorio === "manutencao" && maintenanceReport.data) {
      data = maintenanceReport.data.maintenanceRecords.map((m: any) => ({
        Data: m.data,
        Máquina: m.maquinaId,
        Tipo: m.tipo,
        "HM no Serviço": m.hmMotorNoServico,
        "Tempo Parado (h)": m.tempoParadoH,
        "Troca Óleo": m.trocaOleo ? "Sim" : "Não",
        "Revisão 50h": m.revisao50h ? "Sim" : "Não",
      }));
      filename = `relatorio_manutencoes_${periodo.from}_${periodo.to}.csv`;
    }

    if (data.length === 0) {
      alert("Nenhum dado disponível para exportar");
      return;
    }

    // Gerar CSV
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => {
          const value = row[header];
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? "";
        }).join(",")
      ),
    ];
    const csv = csvRows.join("\n");

    // Salvar e compartilhar
    try {
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });

      if (Platform.OS === "web") {
        // Download no navegador
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Compartilhar no mobile
        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
      alert("Erro ao exportar CSV");
    }
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Relatórios</Text>
          <Text className="text-sm text-muted mt-1">Análise e exportação de dados</Text>
        </View>

        {/* Seletor de Tipo de Relatório */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-2">Tipo de Relatório</Text>
          <View className="flex-row gap-2 flex-wrap">
            <TouchableOpacity
              onPress={() => setTipoRelatorio("diario")}
              className={`px-4 py-2 rounded-full ${
                tipoRelatorio === "diario" ? "bg-primary" : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  tipoRelatorio === "diario" ? "text-white" : "text-foreground"
                }`}
              >
                Diário
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTipoRelatorio("operador")}
              className={`px-4 py-2 rounded-full ${
                tipoRelatorio === "operador" ? "bg-primary" : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  tipoRelatorio === "operador" ? "text-white" : "text-foreground"
                }`}
              >
                Operadores
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTipoRelatorio("manutencao")}
              className={`px-4 py-2 rounded-full ${
                tipoRelatorio === "manutencao" ? "bg-primary" : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  tipoRelatorio === "manutencao" ? "text-white" : "text-foreground"
                }`}
              >
                Manutenções
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Relatório Diário */}
        {tipoRelatorio === "diario" && dailyReport.data && (
          <View className="gap-4">
            {/* Métricas Principais */}
            <View className="bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-lg font-bold text-foreground mb-4">Resumo do Dia</Text>
              <View className="gap-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Máquinas Operando</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {dailyReport.data.maquinasOperando}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Divergências</Text>
                  <Text
                    className={`text-sm font-semibold ${
                      dailyReport.data.maquinasComDivergencia > 0 ? "text-error" : "text-success"
                    }`}
                  >
                    {dailyReport.data.maquinasComDivergencia}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Total Horas Motor</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {dailyReport.data.totalHorasMotor.toFixed(1)}h
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Total Horas Produção</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {dailyReport.data.totalHorasProd.toFixed(1)}h
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Área Colhida</Text>
                  <Text className="text-sm font-semibold text-primary">
                    {dailyReport.data.totalArea.toFixed(2)} ha
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Produtividade Média</Text>
                  <Text className="text-sm font-semibold text-primary">
                    {dailyReport.data.produtividadeMedia.toFixed(2)} ha/h
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Relatório de Operadores */}
        {tipoRelatorio === "operador" && operatorsReport.data && (
          <View className="gap-4">
            <Text className="text-lg font-bold text-foreground mb-2">Ranking de Operadores</Text>
            {operatorsReport.data.map((op: any, index: number) => (
              <View key={index} className="bg-surface rounded-2xl p-4 border border-border">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
                      <Text className="text-white font-bold text-sm">{index + 1}</Text>
                    </View>
                    <Text className="text-base font-bold text-foreground">{op.operador}</Text>
                  </View>
                  <Text className="text-sm font-semibold text-primary">
                    {op.produtividadeMedia.toFixed(2)} ha/h
                  </Text>
                </View>
                <View className="gap-2">
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-muted">Total Dias</Text>
                    <Text className="text-xs font-semibold text-foreground">{op.totalDias}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-muted">Total Área</Text>
                    <Text className="text-xs font-semibold text-foreground">
                      {op.totalArea.toFixed(2)} ha
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-muted">Taxa Divergência</Text>
                    <Text
                      className={`text-xs font-semibold ${
                        op.taxaDivergencia > 10 ? "text-error" : "text-success"
                      }`}
                    >
                      {op.taxaDivergencia.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Relatório de Manutenções */}
        {tipoRelatorio === "manutencao" && maintenanceReport.data && (
          <View className="gap-4">
            {/* Resumo de Manutenções */}
            <View className="bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-lg font-bold text-foreground mb-4">Resumo de Manutenções</Text>
              <View className="gap-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Total Manutenções</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {maintenanceReport.data.totalManutencoes}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Custo Total Peças</Text>
                  <Text className="text-sm font-semibold text-error">
                    R$ {maintenanceReport.data.totalCustoPecas.toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Tempo Parado Total</Text>
                  <Text className="text-sm font-semibold text-warning">
                    {maintenanceReport.data.totalTempoParado.toFixed(1)}h
                  </Text>
                </View>
              </View>
            </View>

            {/* Por Tipo */}
            <View className="bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-base font-bold text-foreground mb-3">Por Tipo</Text>
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Preventiva</Text>
                  <Text className="text-sm font-semibold text-success">
                    {maintenanceReport.data.byType.preventiva}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Corretiva Leve</Text>
                  <Text className="text-sm font-semibold text-warning">
                    {maintenanceReport.data.byType.corretiva_leve}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Corretiva Pesada</Text>
                  <Text className="text-sm font-semibold text-error">
                    {maintenanceReport.data.byType.corretiva_pesada}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Botões de Exportação */}
        <View className="mt-6 mb-8 gap-3">
          <TouchableOpacity
            onPress={handleExportPDF}
            className="bg-primary py-4 rounded-full items-center"
          >
            <Text className="text-white font-bold text-base">📄 Exportar PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleExportCSV}
            className="bg-surface border border-primary py-4 rounded-full items-center"
          >
            <Text className="text-primary font-bold text-base">📊 Exportar CSV</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
