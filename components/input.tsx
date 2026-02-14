import { Text, TextInput, View, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
}

export function Input({
  label,
  error,
  required,
  className,
  ...props
}: InputProps) {
  return (
    <View className="gap-2">
      {label && (
        <Text className="text-sm font-semibold text-foreground">
          {label}
          {required && <Text className="text-error"> *</Text>}
        </Text>
      )}
      <TextInput
        className={cn(
          "bg-surface border rounded-lg px-4 py-3 text-foreground",
          error ? "border-error" : "border-border",
          className
        )}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && (
        <Text className="text-sm text-error">{error}</Text>
      )}
    </View>
  );
}
