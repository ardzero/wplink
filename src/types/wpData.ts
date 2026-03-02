export type wpData = {
	phone: string;
	wpLink: string;
	name?: string;
};

export type StoredWpData = wpData & { createdAt?: string };

export type countryCode = {
    code: string;
    country: string;
    dialCode: string;
    maxDigits: number;
};

