import { ActivityIndicator, Text, TouchableOpacity, type TouchableOpacityProps } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Button({
  title,
  variant = "primary",
  loading = false,
  size = "md",
  disabled,
  className,
  ...props
}: ButtonProps) {
  const colors = useColors();

  const sizeClasses = {
    sm: "py-2 px-4",
    md: "py-3 px-6",
    lg: "py-4 px-8",
  };

  const variantClasses = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    outline: "bg-transparent border-2 border-primary",
  };

  const textColorClasses = {
    primary: "text-white",
    secondary: "text-foreground",
    outline: "text-primary",
  };

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      className={cn(
        "rounded-full items-center justify-center flex-row gap-2",
        sizeClasses[size],
        variantClasses[variant],
        (disabled || loading) && "opacity-50",
        className
      )}
      {...props}
    >
      {loading && <ActivityIndicator size="small" color={variant === "primary" ? "#FFFFFF" : colors.primary} />}
      <Text className={cn("font-bold text-center", textColorClasses[variant])}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
