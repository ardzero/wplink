import { useRef, useState } from "react";
import { cn, getBaseUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { wpData } from "@/types/wpData";
import { matchDialCodeFromPhone } from "@/lib/utils/numberUtils";

import { WPNav } from "./wp-nav";
import { FlagIcon } from "./flag";
import { ButtonGrid } from "./button-grid";

const PHONE_INPUT_REGEX = /[^\d+\s\-()]/g;
const E164_MAX_DIGITS = 15;

function sanitizePhoneInput(value: string): string {
	let out = value.replace(PHONE_INPUT_REGEX, "");
	// At most one leading +
	const hasPlus = out.includes("+");
	out = out.replace(/\+/g, "");
	if (hasPlus) out = "+" + out;
	// E.164: max 15 digits
	const digits = out.replace(/\D/g, "");
	if (digits.length > E164_MAX_DIGITS) {
		const keep = digits.slice(0, E164_MAX_DIGITS);
		out = hasPlus ? "+" + keep : keep;
	}
	return out;
}

type TWPGen = {
	className?: string;
};

export function WPGen({ className }: TWPGen) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [wpData, setWpData] = useState<wpData | null>(null);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const number = wpData?.phone ?? "";
		const countryDialCode = matchDialCodeFromPhone(number);
		setWpData({
			phone: number,
			wpLink: "",
			name: "",
			countryDialCode: countryDialCode || undefined,
		});
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value;
		const sanitized = sanitizePhoneInput(raw);
		const countryDialCode = matchDialCodeFromPhone(sanitized);
		setWpData({
			phone: sanitized,
			countryDialCode: countryDialCode || undefined,
			wpLink: "",
			name: "",
		});
	};

	return (
		<div
			className={cn("container flex flex-col gap-12 align-middle", className)}
		>
			<WPNav />
			<form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
				<div className="relative w-full grow sm:max-w-[380px]">
					<input
						ref={inputRef}
						value={wpData?.phone ?? ""}
						onChange={handleInputChange}
						id="phone"
						name="phone"
						type="tel"
						inputMode="numeric"
						placeholder="+880-XXXXX XXXXX"
						className="no-autofill-bg h-full w-full rounded-md border-none bg-card py-3.5 pr-12 pl-4 text-base ring-muted outline-none focus-visible:ring-1"
					/>
					<FlagIcon
						countryDialCode={wpData?.countryDialCode}
						className="absolute top-1/2 right-4 -translate-y-1/2"
					/>
				</div>

				<Button className="h-full min-w-[150px] grow rounded-md bg-primary/65 px-4 py-3.5 text-base text-primary-foreground hover:bg-primary/90">
					Generate Links
				</Button>
			</form>
			<ButtonGrid wpData={wpData} disabled={!wpData?.phone} />
		</div>
	);
}
