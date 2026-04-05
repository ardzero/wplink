import type { StoredWpData } from "@/types/wpData";
import { matchDialCodeFromPhone } from "./numberUtils";

const HISTORY_CAP = 10;

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

/** WhatsApp link: digits only, no +. Optional pre-filled message: ?text=urlencoded. */
export function buildWhatsAppLink(phone: string, defaultMessage?: string): string {
	let digits = phoneToDigits(phone);
	if (digits.startsWith("0")) digits = digits.slice(1);
	const base = `https://wa.me/${digits}`;
	const text = (defaultMessage ?? "").trim();
	return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Google Contacts new contact URL. Phone in E.164-like form (with +). Uses givenname/familyname (Google ignores "name"). */
export function buildGoogleContactsLink(phone: string, name?: string): string {
	const withPlus = phone.trim().startsWith("+")
		? phone.trim()
		: `+${phoneToDigits(phone)}`;
	const trimmed = (name ?? "").trim();
	const space = trimmed.indexOf(" ");
	const givenname = space === -1 ? trimmed : trimmed.slice(0, space);
	const familyname = space === -1 ? "" : trimmed.slice(space + 1);
	const params = new URLSearchParams({ phone: withPlus, givenname, familyname });
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

function escapeCsvCell(value: string): string {
	if (/[",\n\r]/.test(value)) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

/** RFC 4180–style CSV for history export (header + one row per entry). */
export function buildHistoryCsv(entries: StoredWpData[]): string {
	const header = ["name", "phone", "wpLink", "createdAt"].map(escapeCsvCell);
	const lines = entries.map((e) =>
		[e.name ?? "", e.phone, e.wpLink, e.createdAt ?? ""]
			.map((cell) => escapeCsvCell(String(cell)))
			.join(","),
	);
	return [header.join(","), ...lines].join("\r\n");
}

export function downloadTextFile(
	contents: string,
	filename: string,
	mime = "text/plain;charset=utf-8",
): void {
	const blob = new Blob([contents], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

function parseCsvRows(text: string): string[][] {
	const s = text.replace(/^\uFEFF/, "");
	const rows: string[][] = [];
	let row: string[] = [];
	let field = "";
	let i = 0;
	let inQuotes = false;
	while (i < s.length) {
		const c = s[i]!;
		if (inQuotes) {
			if (c === '"') {
				if (s[i + 1] === '"') {
					field += '"';
					i += 2;
					continue;
				}
				inQuotes = false;
				i++;
				continue;
			}
			field += c;
			i++;
			continue;
		}
		if (c === '"') {
			inQuotes = true;
			i++;
			continue;
		}
		if (c === ",") {
			row.push(field);
			field = "";
			i++;
			continue;
		}
		if (c === "\r") {
			i++;
			continue;
		}
		if (c === "\n") {
			row.push(field);
			rows.push(row);
			row = [];
			field = "";
			i++;
			continue;
		}
		field += c;
		i++;
	}
	row.push(field);
	if (row.length > 1 || (row[0]?.trim() ?? "") !== "") {
		rows.push(row);
	}
	return rows;
}

export type ParseHistoryCsvResult =
	| { ok: true; entries: StoredWpData[] }
	| { ok: false; error: string };

/** Parses CSV from export (`name`, `phone`, `wpLink`, `createdAt` header). */
export function parseHistoryCsv(text: string): ParseHistoryCsvResult {
	const trimmed = text.trim();
	if (!trimmed) {
		return { ok: false, error: "CSV is empty." };
	}

	const rows = parseCsvRows(trimmed);
	if (rows.length < 2) {
		return {
			ok: false,
			error: "Add a header row and at least one data row.",
		};
	}

	const header = rows[0]!.map((h) => h.trim().toLowerCase());
	const col = {
		name: header.indexOf("name"),
		phone: header.indexOf("phone"),
		wpLink: header.indexOf("wplink"),
		createdAt: header.indexOf("createdat"),
	};

	if (col.phone < 0) {
		return { ok: false, error: 'Missing a "phone" column in the header row.' };
	}

	const entries: StoredWpData[] = [];
	for (let r = 1; r < rows.length; r++) {
		const cells = rows[r]!;
		const phone = (cells[col.phone] ?? "").trim();
		if (!phone) continue;
		if (phoneToDigits(phone).length === 0) continue;

		const nameVal = col.name >= 0 ? (cells[col.name] ?? "").trim() : "";
		const createdAtRaw =
			col.createdAt >= 0 ? (cells[col.createdAt] ?? "").trim() : "";

		entries.push({
			phone,
			wpLink: buildWhatsAppLink(phone),
			name: nameVal || undefined,
			createdAt: createdAtRaw || undefined,
		});
	}

	if (entries.length === 0) {
		return {
			ok: false,
			error: "No valid rows: each row needs a phone number.",
		};
	}

	return { ok: true, entries };
}

/** Normalize for history name matching (Unicode, spacing, case). */
function normalizeNameForHistoryMatch(name: string): string {
	return name
		.normalize("NFKC")
		.trim()
		.replace(/\s+/g, " ")
		.toLowerCase();
}

/**
 * Upsert one entry into history (newest first, capped at HISTORY_CAP):
 * 1. Same digits → move to top, merge name, prefer phone with dial code.
 * 2. Else if submitted name is non-empty and matches another row (normalized) → same merge; phone comes from the new entry.
 */
export function upsertHistoryEntry(
	current: StoredWpData[],
	entry: { phone: string; wpLink: string; name?: string; createdAt?: string },
	cap: number = HISTORY_CAP,
	defaultMessage?: string,
): StoredWpData[] {
	const digits = phoneToDigits(entry.phone);
	const digitIdx = current.findIndex((e) => phoneToDigits(e.phone) === digits);

	const trimmedName = (entry.name ?? "").trim();
	const nameKey =
		trimmedName !== "" ? normalizeNameForHistoryMatch(trimmedName) : "";

	let existingIdx = digitIdx;
	let matchedByNameOnly = false;
	if (digitIdx < 0 && nameKey !== "") {
		const nameIdx = current.findIndex(
			(e) => normalizeNameForHistoryMatch(e.name ?? "") === nameKey,
		);
		if (nameIdx >= 0) {
			existingIdx = nameIdx;
			matchedByNameOnly = true;
		}
	}

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
			wpLink: buildWhatsAppLink(phone, defaultMessage),
			name,
			createdAt: existing.createdAt ?? now,
		};
	} else {
		const created =
			entry.createdAt !== undefined && String(entry.createdAt).trim() !== ""
				? String(entry.createdAt).trim()
				: now;
		merged = {
			phone: entry.phone.trim(),
			name:
				entry.name !== undefined && entry.name.trim() !== ""
					? entry.name.trim()
					: undefined,
			wpLink: buildWhatsAppLink(entry.phone, defaultMessage),
			createdAt: created,
		};
	}

	const rest = current.filter((e, i) => {
		if (digitIdx >= 0) return i !== digitIdx;
		if (matchedByNameOnly && nameKey !== "")
			return normalizeNameForHistoryMatch(e.name ?? "") !== nameKey;
		return true;
	});
	return [merged, ...rest].slice(0, cap);
}

/** Apply exported rows onto current history (same order as CSV: newest row first). */
export function mergeHistoryImport(
	current: StoredWpData[],
	imported: StoredWpData[],
	defaultMessage?: string,
	cap: number = HISTORY_CAP,
): StoredWpData[] {
	let next = [...current];
	for (const row of imported) {
		next = upsertHistoryEntry(
			next,
			{
				phone: row.phone,
				wpLink: row.wpLink,
				name: row.name,
				createdAt: row.createdAt,
			},
			cap,
			defaultMessage,
		);
	}
	return next;
}
