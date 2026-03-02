---
name: wplink-generator-core
overview: Wire up the WP link generator to support dial-code selection/inference, WhatsApp + Google Contacts links, vCard downloads, persistent prefill settings, and localStorage-backed history with reload.
todos:
  - id: extend-wpdata
    content: Keep `wpData` as-is (phone, wpLink, name?, countryDialCode?) — no email/company.
    status: pending
  - id: core-wpgen-helpers
    content: Add `src/lib/utils/wp-gen.ts` with phone cleaning, dial inference, WA/GContacts URL builders, vCard builder + download helper.
    status: pending
  - id: country-selector-ui
    content: Add a searchable country selector (flag + dial + country) using shadcn `popover` + `command`.
    status: pending
  - id: wire-wpgen-form
    content: "Convert `WPGen` into a stateful form: name+phone inputs, dial selection/inference, generate links, trigger vCard download."
    status: pending
  - id: persist-prefill-settings
    content: Implement prefill toggle+message in Settings with localStorage keys `wplink_prefill_enabled` and `wplink_prefill_message`.
    status: pending
  - id: history-localstorage
    content: Replace sample history with localStorage-backed history (cap 10), show in drawer, and support eye-icon reload into form.
    status: pending
  - id: share-link-button
    content: "Share drawer: two copyable links (wa.me + app getBaseUrl/number link); app link shows pre-filled data when opened."
    status: pending
isProject: false
---

## Current state (what exists)

- `wpData` currently only has `phone`, `wpLink`, optional `name`, optional `countryDialCode`.

```1:12:/Users/farhanashhabnur/Documents/programming/side_projects/wplink/src/types/wpData.ts
export type wpData = {
    phone: string;
    wpLink: string;
    name?: string;
    countryDialCode?: string;
};

export type countryCode = {
    code: string;
    country: string;
    dialCode: string;
};
```

- Full `countryCodes: countryCode[]` list already exists in `src/lib/data/countryCodes.ts`.
- `WPGen` UI exists but has no state / generation logic yet (`src/components/wp-gen/wp-gen.tsx`).
- `History` drawer currently renders `sampleHistory` only (`src/components/wp-gen/history.tsx`).

## Decisions based on your answers

- **No geo auto-detect on load**.
- **No default dial code**. Dial code stays `undefined` until:
  - we infer it from the phone input when it includes a country code (best-effort prefix match).

## WhatsApp Click to Chat (official)

Per [WhatsApp’s Click to Chat docs](https://faq.whatsapp.com/general/chats/how-to-use-click-to-chat):

- **Link format**: `https://wa.me/<number>` where `<number>` is the **full phone number in international format**.
- **Number rules**: Omit any zeroes, brackets, or dashes. No `+` in the URL path.
  - Use: `https://wa.me/1XXXXXXXXXX`
  - Don’t use: `https://wa.me/+001-(XXX)XXXXXXX`
- **Pre-filled message**: `https://wa.me/<number>?text=urlencodedtext` — same number format; `urlencodedtext` is URL-encoded (e.g. `encodeURIComponent`).
- **Prefill only (no number)**: `https://wa.me/?text=urlencodedtext` — not needed for our flow; we always have a number when generating.

Implementation: build the path as digits only (`dialDigits` + `nationalDigits`), no `+`, no spaces/dashes; if prefill is on, append `?text=${encodeURIComponent(prefillMessage)}`.

## Implementation details

### 1) Data model

- Keep `wpData` as-is: `phone`, `wpLink`, optional `name`, optional `countryDialCode`. No email or company.
- Keep `countryCode` type as-is.

### 2) Core pure helpers in `src/lib/utils/wp-gen.ts`

Add conversion and link-building logic in **`src/lib/utils/wp-gen.ts`** (existing file):

- `stripToDigits(input: string): string` — digits only (enables “omit zeroes, brackets, dashes” per WhatsApp).
- `dialDigits(dialCode: string): string` — e.g. "+880" → "880" (no `+` in wa.me path).
- `inferDialCodeFromDigits(digits: string): string | undefined`
  - Build dial-code candidates from `countryCodes` (unique dial digits)
  - Sort by length DESC
  - Find the **longest** prefix match
- `buildWhatsAppLink({ dialCode, nationalDigits, prefillEnabled, prefillMessage }): string`
  - Base: `https://wa.me/{dialDigits}{nationalDigits}` (full number in international format, digits only).
  - If prefill enabled: append `?text=${encodeURIComponent(prefillMessage)}`.
- `buildGoogleContactsLink({ name, dialCode, nationalDigits }): string`
  - `https://contacts.google.com/new?${new URLSearchParams({ name, phone: `+${dialDigits}${nationalDigits}` }).toString()}`
  - URL-encode all param values
- `buildVCard({ name, dialCode, nationalDigits }): string` (vCard 3.0; name, phone only)
- `downloadVCard(vcard: string, filenameBase: string): void`
- `buildAppShareLink({ name?, phone, countryDialCode }): string` — `getBaseUrl('number')` + query params (`phone`, `countryDialCode`, and `name` only when name is present); URL-encode values. Used so that when someone opens the link, the app can show the data.

### 3) Country code selector (searchable)

- Add a dedicated component `src/components/wp-gen/country-selector.tsx`:
  - Displays selected: flag + dial code (or placeholder)
  - Search UI: flag + dial code + country name
  - Emits `onSelect(countryCode)`
- Add needed shadcn ui components (via bun):
  - `command`, `popover` (for combobox)
  - likely `button` already exists; reuse it

### 4) WPGen form wiring

Update `src/components/wp-gen/wp-gen.tsx` to become the single source of truth for:

- **Inputs/state**:
  - `name` (new field in main input row alongside phone)
  - `phoneRaw`
  - `selectedCountry?: countryCode` (or just `selectedDialCode?: string`)
  - `prefillEnabled`, `prefillMessage` (localStorage-backed)
  - `generated`: `{ waLink: string; contactLink: string; vcard: string } | null`
- **Inference behavior (your requested "parse from number")**:
  - On `phoneRaw` change:
    - `digits = stripToDigits(phoneRaw)`
    - If it looks like it includes a country prefix (e.g. user typed `+...` or the digits match a known dial prefix): infer `dialCode` and set selector to that, and set `nationalDigits = digits.slice(prefixLen)`
    - Otherwise keep dialCode undefined (no default)
- **Generate button**:
  - Require: `dialCode` present AND `nationalDigits` present
  - Compute WhatsApp link, Google Contacts link, vCard payload
  - Save to history (see #5)
- **UI outputs**:
  - WhatsApp card: `<a href={waLink} target="_blank">`
  - Google Contact card: `<a href={contactLink} target="_blank">`
  - Save on phone card: button-ish element that triggers vCard download

### 5) History (localStorage)

- Replace `sampleHistory` usage with localStorage-backed history.
- Storage key (new): `wplink_history`
- Persist entries as `wpData[]` (newest first), cap to 10.
- Save on every generation:
  - Entry contains: `name?`, `countryDialCode`, `phone` (national digits), `wpLink`
  - Optional: dedupe by `(countryDialCode, phone, name)` before unshifting.
- Update `src/components/wp-gen/history.tsx` to accept props:
  - `items: wpData[]`
  - `onLoad(item: wpData)`
- Update `src/components/wp-gen/history-card.tsx`:
  - Make the **eye icon a real button**; clicking it calls `onLoad`
  - Keep showing flag via `/flags/${code}.svg` using existing `getCountryByDialCode`.

### 6) Prefill message persistence (localStorage)

- Keys exactly as requested:
  - `wplink_prefill_enabled`
  - `wplink_prefill_message`
- Implement UI in `src/components/wp-gen/settings.tsx`:
  - Add toggle (shadcn `switch`)
  - Add message input (shadcn `textarea`)
- Add shadcn components (via bun): `switch`, `textarea`.

### 7) Share link — two copyable links + app link opens with data

The Share flow exposes **two links** the user can copy:

1. **WhatsApp link**: The generated `wa.me/...` link (current entry's WhatsApp Click to Chat URL).
2. **App link**: `getBaseUrl('/number')` plus query params so that when someone opens it, the app shows the contact data (pre-filled form).
   - Params: `phone`, `countryDialCode`, and **`name` only if name is available** (omit `name` when empty).
   - Build with `URLSearchParams` and URL-encode values; append `?${params.toString()}` to `getBaseUrl('/number')`.

**When someone opens the app link:** On load of the page that hosts the generator (e.g. index or a `/number` route), read URL search params (`phone`, `countryDialCode`, `name`) and pre-fill the form so the contact data is shown.

**ShareLink component** (`src/components/wp-gen/share-link.tsx`):
- Receives current generated data (waLink + appShareLink, or builds app link from current wpData).
- Shows both links in the drawer, each with its own copy button (reuse “copied” feedback pattern from `CopyButton`).
- Optional: primary "Share" action can use `navigator.share` with the app link, falling back to copying one link to clipboard.

## Files to change / add

- No change to `wpData` type (already has phone, wpLink, name?, countryDialCode?).
- Implement: `[src/lib/utils/wp-gen.ts](/Users/farhanashhabnur/Documents/programming/side_projects/wplink/src/lib/utils/wp-gen.ts)` (conversion + link builders)
- Add: `[src/components/wp-gen/country-selector.tsx](/Users/farhanashhabnur/Documents/programming/side_projects/wplink/src/components/wp-gen/country-selector.tsx)`
- Update: `[src/components/wp-gen/wp-gen.tsx](/Users/farhanashhabnur/Documents/programming/side_projects/wplink/src/components/wp-gen/wp-gen.tsx)`
- Update: `[src/components/wp-gen/history.tsx](/Users/farhanashhabnur/Documents/programming/side_projects/wplink/src/components/wp-gen/history.tsx)`
- Update: `[src/components/wp-gen/history-card.tsx](/Users/farhanashhabnur/Documents/programming/side_projects/wplink/src/components/wp-gen/history-card.tsx)`
- Update: `[src/components/wp-gen/settings.tsx](/Users/farhanashhabnur/Documents/programming/side_projects/wplink/src/components/wp-gen/settings.tsx)`
- Update: `[src/components/wp-gen/share-link.tsx](/Users/farhanashhabnur/Documents/programming/side_projects/wplink/src/components/wp-gen/share-link.tsx)` — two copyable links (wa.me + app link); app link uses `getBaseUrl('/number')` with params (phone, countryDialCode, name only if present).
- App link open behavior: on page load, read `phone`, `countryDialCode`, `name` from URL and pre-fill the generator form (implement in WPGen and/or the page that mounts it; add `/number` route if desired so app link is `getBaseUrl('number')?...`).

## Installs (bun + shadcn)

- `bunx --bun shadcn@latest add command popover switch textarea`
