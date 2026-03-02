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
export const matchDialCodeFromPhone = (phone: string): string | null => {
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


const PHONE_INPUT_REGEX = /[^\d+\s\-()]/g;
const E164_MAX_DIGITS = 15;

export const sanitizePhoneInput = (value: string): string => {
    let out = value.replace(PHONE_INPUT_REGEX, "");
    // At most one leading +
    const hasPlus = out.includes("+");
    out = out.replace(/\+/g, "");
    // Collapse multiple spaces to a single space (allow single spaces, max 1 between chars)
    out = out.replace(/\s+/g, " ");
    if (hasPlus) out = "+" + out;
    // E.164: max 15 digits — truncate from end keeping spacing
    const digits = out.replace(/\D/g, "");
    if (digits.length > E164_MAX_DIGITS) {
        let digitCount = 0;
        let i = 0;
        while (i < out.length && digitCount < E164_MAX_DIGITS) {
            if (/\d/.test(out[i])) digitCount++;
            i++;
        }
        out = out.slice(0, i);
    }
    return out;
}
