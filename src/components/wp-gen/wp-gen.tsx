import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { StoredWpData, wpData } from "@/types/wpData";
import { sanitizePhoneInput } from "@/lib/utils/numberUtils";
import { parseAsBoolean, useUrlParam } from "@/hooks/useUrlParam";
import { useStorage } from "@/hooks/useStorage";
import {
	defaultPrivacySettings,
	WPLINK_PRIVACY_STORAGE_KEY,
	WPLINK_DEFAULT_MESSAGE_STORAGE_KEY,
	defaultMessageSettings,
} from "@/types/wpData";
import { buildWhatsAppLink, upsertHistoryEntry } from "@/lib/utils/wp-gen";

import { Button } from "@/components/ui/button";
import { WPNav } from "./wp-nav";
import { FlagIcon } from "./flag";
import { ButtonGrid } from "./button-grid";
import { RotateCcw } from "lucide-react";

type TWPGen = {
	className?: string;
};

export function WPGen({ className }: TWPGen) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [phone, setPhone] = useUrlParam("p", {
		transform: sanitizePhoneInput,
	});
	const [name, setName] = useUrlParam("n", {
		transform: (value) => value || "",
	});
	// Boolean
	const [completed, setCompleted] = useUrlParam(
		"c",
		parseAsBoolean.withDefault(false),
	);

	const [wpData, setWpData] = useState<wpData | null>(null);
	const [history, setHistory] = useStorage("wplink_history", {
		default: [] as StoredWpData[],
	});
	const [privacy] = useStorage(WPLINK_PRIVACY_STORAGE_KEY, {
		default: defaultPrivacySettings,
	});
	const [defaultMessage] = useStorage(WPLINK_DEFAULT_MESSAGE_STORAGE_KEY, {
		default: defaultMessageSettings,
	});
	// Avoid flash of unblurred inputs on reload: until storage has hydrated, when
	// there's no c param assume ultra-privacy (blur) so we don't reveal on first paint.
	const [storageHydrated, setStorageHydrated] = useState(false);
	useEffect(() => setStorageHydrated(true), []);
	const blurNameInHome =
		(!storageHydrated && !completed) ||
		privacy.ultraPrivacyMode ||
		(completed && privacy.blurNameInHome);
	const blurNumberInHome =
		(!storageHydrated && !completed) ||
		privacy.ultraPrivacyMode ||
		(completed && privacy.blurNumberInHome);
	const historyRef = useRef(history);
	historyRef.current = history;

	const defaultText =
		defaultMessage.enabled && defaultMessage.message.trim()
			? defaultMessage.message.trim()
			: undefined;

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!phone) return;
		const wpLink = buildWhatsAppLink(phone, defaultText);
		const data: wpData = { phone, wpLink, name: name || undefined };
		setWpData(data);
		setCompleted(true);
		setHistory(upsertHistoryEntry(history, data, undefined, defaultText));
	};

	// Hydrate from URL when c=true and p present
	useEffect(() => {
		if (!completed || !phone) return;
		const wpLink = buildWhatsAppLink(phone, defaultText);
		const data: wpData = { phone, wpLink, name: name || undefined };
		setWpData(data);
		setHistory(upsertHistoryEntry(historyRef.current, data, undefined, defaultText));
	}, [completed, phone, name, defaultText, setHistory]);

	const handleReset = () => {
		setPhone("");
		setName("");
		setWpData(null);
		setCompleted(false);
	};

	return (
		<div
			className={cn("container flex flex-col gap-6 align-middle", className)}
		>
			<WPNav />
			<form onSubmit={handleSubmit} className="mb-2 flex flex-wrap gap-2">
				<div className="flex w-full flex-wrap justify-end gap-2 align-bottom min-[525px]:flex-nowrap">
					<div className="w-full grow basis-1/2">
						{/* <label htmlFor="name">
							Name <span className="text-muted-foreground/65">(optional)</span>
						</label> */}
						<input
							disabled={completed}
							aria-disabled={completed}
							tabIndex={completed ? -1 : 0}
							value={name}
							onChange={(e) => setName(e.target.value)}
							id="name"
							name="name"
							type="text"
							placeholder="Name (optional)"
							className={cn(
								"no-autofill-bg w-full rounded-md border-none bg-card py-3.5 pr-12 pl-4 text-base ring-muted outline-none focus-visible:ring-1",
								completed && "text-muted-foreground/65!",
								blurNameInHome && "blur-xs hover:blur-none",
							)}
						/>
					</div>
					<div className="relative w-full grow basis-1/2 self-end">
						<input
							disabled={completed}
							aria-disabled={completed}
							tabIndex={completed ? -1 : 0}
							ref={inputRef}
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							id="phone"
							name="phone"
							type="tel"
							inputMode="numeric"
							placeholder="+880-XXXXX XXXXX"
							className={cn(
								"no-autofill-bg w-full rounded-md border-none bg-card py-3.5 pr-12 pl-4 text-base ring-muted outline-none focus-visible:ring-1",
								completed &&
									"text-muted-foreground/65 focus-visible:text-muted-foreground/65",
								blurNumberInHome && "blur-xs hover:blur-none",
							)}
						/>
						<FlagIcon
							phone={phone}
							className="absolute top-1/2 right-4 -translate-y-1/2"
						/>
					</div>
				</div>
				<div className="relative flex w-full gap-2">
					<Button
						size={"icon"}
						className="h-full min-w-[40px]"
						disabled={!completed}
						aria-disabled={!completed}
						aria-label="Reset the number"
						variant={"destructive"}
						onClick={handleReset}
						title="Reset"
					>
						<span className="sr-only">Reset</span>
						<RotateCcw className="size-4" />
					</Button>
					<Button
						className={cn(
							"relative z-10 h-full grow rounded-md bg-primary/65 text-base text-primary-foreground",
							completed
								? "pointer-events-none opacity-65"
								: "hover:bg-primary/90",
						)}
						type="submit"
					>
						Generate Links
					</Button>
					<div className="pointer-events-none absolute inset-0 -z-10 rounded-md bg-background" />
				</div>
			</form>
			<ButtonGrid wpData={wpData} disabled={!completed} />
		</div>
	);
}
