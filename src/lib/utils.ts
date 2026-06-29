type ClassValue = string | number | false | null | undefined | ClassValue[] | { [key: string]: boolean | undefined };

export function cn(...inputs: ClassValue[]) {
  return inputs.flatMap(normalizeClassValue).filter(Boolean).join(" ");
}

function normalizeClassValue(input: ClassValue): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.flatMap(normalizeClassValue);
  if (typeof input === "object") {
    return Object.entries(input)
      .filter(([, enabled]) => enabled)
      .map(([className]) => className);
  }
  return [String(input)];
}

export function formatDuration(minutes?: number | null) {
  if (!minutes) return "A consultar";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

export function formatPrice(price?: number | null, requiresQuote = false) {
  if (requiresQuote || !price) return "Cotizar";
  return `Desde RD$${new Intl.NumberFormat("es-DO").format(price)}`;
}
