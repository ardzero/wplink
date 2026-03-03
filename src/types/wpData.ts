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
	blurNumbersInHistory: true,
	blurNamesInHistory: true,
	blurNameInHome: true,
	blurNumberInHome: true,
	blurShareLinks: true,
	ultraPrivacyMode: false,
};

export const WPLINK_PRIVACY_STORAGE_KEY = "wplink_privacy_settings";

export type countryCode = {
    code: string;
    country: string;
    dialCode: string;
    maxDigits: number;
};

