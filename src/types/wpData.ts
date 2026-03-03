export type wpData = {
	phone: string;
	wpLink: string;
	name?: string;
};

export type StoredWpData = wpData & { createdAt?: string };

export type WplinkPrivacySettings = {
	blurNumbersInHistory: boolean;
	blurNamesInHistory: boolean;
	blurNameInHome: boolean;
	blurNumberInHome: boolean;
	blurShareLinks: boolean;
	ultraPrivacyMode: boolean;
};

export const defaultPrivacySettings: WplinkPrivacySettings = {
	blurNumbersInHistory: false,
	blurNamesInHistory: false,
	blurNameInHome: false,
	blurNumberInHome: false,
	blurShareLinks: false,
	ultraPrivacyMode: false,
};

export const WPLINK_PRIVACY_STORAGE_KEY = "wplink_privacy_settings";

export type countryCode = {
	code: string;
	country: string;
	dialCode: string;
	maxDigits: number;
};

