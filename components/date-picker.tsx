import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";

interface DatePickerProps {
  value: string; // formato: YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  className?: string;
}

export function DatePicker({ value, onChange, label, className }: DatePickerProps) {
  const [show, setShow] = useState(false);

  const dateValue = value ? new Date(value + "T12:00:00") : new Date();

  const handleChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShow(false);
    }
    
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split("T")[0];
      onChange(formatted);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handlePress = () => {
    setShow(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const formattedDisplay = dateValue.toLocaleDateString("pt-BR", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <View className={className}>
      {label && <Text className="text-base font-semibold text-foreground mb-2">{label}</Text>}
      
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        className="bg-surface border-2 border-border rounded-xl px-4 py-4 flex-row items-center justify-between min-h-touch"
      >
        <Text className="text-lg text-foreground">📅 {formattedDisplay}</Text>
        <Text className="text-muted">▼</Text>
      </Pressable>

      {show && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
          locale="pt-BR"
        />
      )}
      
      {show && Platform.OS === "ios" && (
        <Pressable
          onPress={() => setShow(false)}
          className="mt-2 bg-primary rounded-xl py-3 items-center"
        >
          <Text className="text-white font-semibold text-base">Confirmar</Text>
        </Pressable>
      )}
    </View>
  );
}
