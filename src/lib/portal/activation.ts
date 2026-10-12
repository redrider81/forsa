/**
 * Input rules for first-time activation of a client account. Pure functions,
 * shared by the activation form and the activation route.
 */

export const ACTIVATION_TYPES = ["invite", "recovery"] as const;
export type ActivationType = (typeof ACTIVATION_TYPES)[number];

export const PASSWORD_MIN_LENGTH = 10;
/** bcrypt, used by Supabase Auth, ignores everything after 72 bytes. */
export const PASSWORD_MAX_BYTES = 72;

/** Supabase Auth hashed tokens are hex digests (56 characters today). */
export function isValidTokenHash(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{40,128}$/.test(value);
}

export function isActivationType(value: unknown): value is ActivationType {
  return typeof value === "string" && (ACTIVATION_TYPES as readonly string[]).includes(value);
}

/** Returns a Swedish error message, or null when the password is acceptable. */
export function passwordProblem(password: unknown): string | null {
  if (typeof password !== "string" || password.trim().length === 0) return "Ange ett lösenord.";
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Lösenordet behöver vara minst ${PASSWORD_MIN_LENGTH} tecken.`;
  }
  if (new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES) {
    return "Lösenordet är för långt. Välj ett kortare lösenord.";
  }
  if (password.trim() !== password) return "Lösenordet kan inte börja eller sluta med mellanslag.";
  return null;
}

/** Reads type and token from the link fragment "#aktivera-<type>-<token>". */
export function parseActivationFragment(hash: string): { tokenHash: string; type: ActivationType } | null {
  const match = /^#?aktivera-([a-z]+)-([a-f0-9]+)$/.exec(hash);
  if (!match) return null;
  const [, type, tokenHash] = match;
  if (!isValidTokenHash(tokenHash) || !isActivationType(type)) return null;
  return { tokenHash, type };
}
