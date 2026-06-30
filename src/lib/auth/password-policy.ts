const specialCharacterPattern = /[^A-Za-z0-9]/;

export function getPasswordPolicyErrors(password: string) {
  const errors: string[] = [];

  if (password.length < 8) errors.push("Debe tener al menos 8 caracteres.");
  if (!/[A-Z]/.test(password)) errors.push("Debe incluir una mayuscula.");
  if (!/[a-z]/.test(password)) errors.push("Debe incluir una minuscula.");
  if (!/[0-9]/.test(password)) errors.push("Debe incluir un numero.");
  if (!specialCharacterPattern.test(password)) errors.push("Debe incluir un caracter especial.");

  return errors;
}

export function isStrongPassword(password: string) {
  return getPasswordPolicyErrors(password).length === 0;
}

export function passwordPolicyMessage(password: string) {
  const errors = getPasswordPolicyErrors(password);
  return errors.length ? errors.join(" ") : null;
}
