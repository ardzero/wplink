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
/** Minimum length of national number (after dial code) to consider the number valid */
const MIN_NATIONAL_LENGTH = 7;

/**
 * Fuzzy match a phone number to a country dial code. Returns the dial code when:
 * - Input starts with "+" and the digits after it start with a dial code (exact or more digits), or
 * - The input is exactly a dial code (e.g. "880", "44"), or
 * - The input is a full number (dial code + at least MIN_NATIONAL_LENGTH digits).
 * Returns null for partial numbers without "+" (e.g. "880186" with only 3 national digits).
 */
export function matchDialCodeFromPhone(phone: string): string | null {
    if (!phone?.trim()) return null;
    const digits = normalizePhoneDigits(phone);
    if (!digits.length) return null;
    const startsWithPlus = phone.trim().startsWith("+");
    for (const prefix of DIAL_CODE_PREFIXES) {
        if (!digits.startsWith(prefix)) continue;
        const nationalLength = digits.length - prefix.length;
        const exactMatch = digits === prefix;
        const fullNumber = nationalLength >= MIN_NATIONAL_LENGTH;
        if (startsWithPlus || exactMatch || fullNumber) {
            return DIAL_BY_PREFIX.get(prefix) ?? `+${prefix}`;
        }
    }
    return null;
}
