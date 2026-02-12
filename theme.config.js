// theme.config.js
const themeColors = {
  primary:   { light: "#166534", dark: "#22C55E" },  // verde “campo”
  success:   { light: "#16A34A", dark: "#4ADE80" },
  warning:   { light: "#F59E0B", dark: "#FBBF24" },
  error:     { light: "#DC2626", dark: "#F87171" },

  background:{ light: "#F5F7FA", dark: "#0B1220" },  // fundo
  surface:   { light: "#FFFFFF", dark: "#111827" },  // cards
  foreground:{ light: "#0F172A", dark: "#F8FAFC" },  // texto
  muted:     { light: "#64748B", dark: "#94A3B8" },  // texto secundário
  border:    { light: "#E2E8F0", dark: "#1F2937" },  // bordas

  // extras (opcional mas ajuda MUITO)
  card:      { light: "#FFFFFF", dark: "#0F172A" },
};

module.exports = { themeColors };
