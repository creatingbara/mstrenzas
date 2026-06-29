export const USERNAME_PATTERN = /^[a-z0-9._]{3,30}$/;

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function validateUsername(username: string) {
  const normalized = normalizeUsername(username);

  if (!normalized) return "El usuario es obligatorio.";
  if (normalized.length < 3) return "El usuario debe tener minimo 3 caracteres.";
  if (!USERNAME_PATTERN.test(normalized)) {
    return "El usuario solo puede tener letras, numeros, punto y guion bajo.";
  }

  return null;
}

export function usernameFromName(name: string) {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._\s-]/g, "")
    .trim()
    .split(/\s+/)
    .find((part) => part.length >= 3);

  return normalized?.replace(/[^a-z0-9._]/g, "") || "usuario";
}

export function internalEmailForUsername(username: string) {
  return `${normalizeUsername(username)}@ms-trenzas.local`;
}

export function isInternalUsernameEmail(email?: string | null) {
  return Boolean(email && email.toLowerCase().endsWith("@ms-trenzas.local"));
}

export function displayContactEmail(email?: string | null) {
  return isInternalUsernameEmail(email) ? "No indicado" : email || "No indicado";
}
