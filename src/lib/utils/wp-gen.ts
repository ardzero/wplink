import { countryCodes } from "@/lib/data/countryCodes";

/** Numeric part of dial codes, longest first so e.g. +1268 matches before +1 */
const DIAL_CODE_PREFIXES = [...new Set(countryCodes.map((c) => c.dialCode.replace(/^\+\s*/, "")))].sort(
  (a, b) => b.length - a.length
);

const DIAL_BY_PREFIX = new Map<string, string>(
  countryCodes.map((c) => {
    const num = c.dialCode.replace(/^\+\s*/, "");
    return [num, c.dialCode];
  })
);

/**
 * Normalize phone input to digits only. Strips +, spaces, dashes, and leading 00.
 */
function normalizePhoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) return digits.slice(2);
  return digits;
}

/**
 * Fuzzy match a phone number (or dial code string) to a country dial code.
 * Handles: "+44 7911 123456", "447911123456", "0044 79 11 12 34 56", "44", "+ 44".
 * Returns the canonical dial code (e.g. "+44") or null if no match.
 */
export function matchDialCodeFromPhone(phone: string): string | null {
  if (!phone?.trim()) return null;
  const digits = normalizePhoneDigits(phone);
  if (!digits.length) return null;
  for (const prefix of DIAL_CODE_PREFIXES) {
    if (digits === prefix || digits.startsWith(prefix)) {
      return DIAL_BY_PREFIX.get(prefix) ?? `+${prefix}`;
    }
  }
  return null;
}
