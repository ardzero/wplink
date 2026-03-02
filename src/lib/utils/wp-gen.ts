import type { StoredWpData } from "@/types/wpData";
import { matchDialCodeFromPhone } from "./numberUtils";

/** Digits only (for equality / deduplication). Strips +, spaces, dashes, leading 00. */
export function phoneToDigits(phone: string): string {
	const digits = phone.replace(/\D/g, "");
	return digits.startsWith("00") ? digits.slice(2) : digits;
}

/** Returns the phone string that has dial code (leading + or known dial prefix). */
export function preferPhoneWithDialCode(phoneA: string, phoneB: string): string {
	const aHasDial = phoneA.trim().startsWith("+") || matchDialCodeFromPhone(phoneA);
	const bHasDial = phoneB.trim().startsWith("+") || matchDialCodeFromPhone(phoneB);
	if (aHasDial && !bHasDial) return phoneA;
	if (bHasDial && !aHasDial) return phoneB;
	return phoneA.trim().startsWith("+") ? phoneA : phoneB;
}

/** WhatsApp link: digits only, no +. https://wa.me/<digits> */
export function buildWhatsAppLink(phone: string): string {
	const digits = phoneToDigits(phone);
	return `https://wa.me/${digits}`;
}

/** Google Contacts new contact URL. Phone in E.164-like form (with +). */
export function buildGoogleContactsLink(phone: string, name?: string): string {
	const withPlus = phone.trim().startsWith("+")
		? phone.trim()
		: `+${phoneToDigits(phone)}`;
	const params = new URLSearchParams({ phone: withPlus, name: name ?? "" });
	return `https://contacts.google.com/new?${params.toString()}`;
}

/** vCard 3.0 string with FN, N, TEL, REV (date created). */
export function buildVCard(
	name: string | undefined,
	phone: string,
	createdAt: Date,
): string {
	const rev = createdAt.toISOString().slice(0, 10).replace(/-/g, "");
	const lines = [
		"BEGIN:VCARD",
		"VERSION:3.0",
		`FN:${name ?? phone}`,
		`N:${name ?? ""};;;`,
		`TEL;TYPE=CELL:${phone.trim().startsWith("+") ? phone.trim() : `+${phoneToDigits(phone)}`}`,
		`REV:${rev}`,
		"END:VCARD",
	];
	return lines.join("\r\n");
}

/** Download vCard as .vcf file. */
export function downloadVCard(vcard: string, filenameBase: string): void {
	const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `contact-${filenameBase.replace(/[^\w-]/g, "")}.vcf`;
	a.click();
	URL.revokeObjectURL(url);
}

const HISTORY_CAP = 10;

/**
 * Upsert one entry into history: same digits = move to top and update name; prefer phone with dial code.
 * Returns new array (newest first), capped at HISTORY_CAP.
 */
export function upsertHistoryEntry(
	current: StoredWpData[],
	entry: { phone: string; wpLink: string; name?: string },
	cap: number = HISTORY_CAP,
): StoredWpData[] {
	const digits = phoneToDigits(entry.phone);
	const existingIdx = current.findIndex((e) => phoneToDigits(e.phone) === digits);
	const now = new Date().toISOString();

	let merged: StoredWpData;
	if (existingIdx >= 0) {
		const existing = current[existingIdx];
		const phone = preferPhoneWithDialCode(entry.phone, existing.phone);
		const name =
			entry.name !== undefined && entry.name !== ""
				? entry.name
				: existing.name ?? undefined;
		merged = {
			phone,
			wpLink: buildWhatsAppLink(phone),
			name,
			createdAt: existing.createdAt ?? now,
		};
	} else {
		merged = {
			...entry,
			createdAt: now,
		};
	}

	const rest = current.filter((_, i) => i !== existingIdx);
	return [merged, ...rest].slice(0, cap);
}
