import { cn, getBaseUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download, Cog, History as HistoryIcon } from "lucide-react";
import { ShareLink } from "./share-link";
import { History } from "./history";
import { Settings } from "./settings";
import { useRef, useState } from "react";
import type { wpData } from "@/types/wpData";
import { FlagIcon } from "./flag";
import { matchDialCodeFromPhone } from "@/lib/utils/wp-gen";

const PHONE_INPUT_REGEX = /[^\d+\s\-()]/g;
function sanitizePhoneInput(value: string): string {
	return value.replace(PHONE_INPUT_REGEX, "");
}

type TWPGen = {
	className?: string;
};
const baseClassName =
	"flex min-h-[180px] w-full flex-col items-center justify-center align-middle text-center justify-items-center gap-3 rounded-md bg-card hover:bg-muted transition-colors duration-200 text-foreground group";

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
			<nav className="flex flex-wrap place-items-center justify-between gap-6">
				<a href="/" className="text-2xl font-semibold text-muted-foreground">
					wplink
				</a>
				<div className="flex flex-wrap gap-1">
					<History>
						<Button
							className={cn(baseClassName, "size-[40px] min-h-auto")}
							title="History"
						>
							<HistoryIcon className="size-4.5 opacity-65 transition-opacity duration-200 group-hover:opacity-100" />

							<span className="sr-only">History</span>
						</Button>
					</History>
					<Settings>
						<Button
							className={cn(baseClassName, "size-[40px] min-h-auto")}
							title="Settings"
						>
							<Cog className="size-4.5 opacity-65 transition-opacity duration-200 group-hover:opacity-100" />
							<span className="sr-only">Settings</span>
						</Button>
					</Settings>
				</div>
			</nav>
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
						className="h-full w-full rounded-md border-none bg-card py-3.5 pr-12 pl-4 text-base ring-muted outline-none focus-visible:ring-1"
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
			<div
				className={cn(
					"grid grid-cols-2 gap-2 rounded-md bg-background",
					!wpData?.wpLink &&
						"pointer-events-none *:pointer-events-none *:opacity-35 dark:*:opacity-25",
				)}
				aria-disabled={wpData?.wpLink ? false : true}
			>
				<a href="" className={cn(baseClassName, "col-span-2")} target="_blank">
					<img src="/favicon.svg" alt="wp-gen-1" className="size-16" />
					<p className="text-xl font-medium opacity-45">Message on WhatsApp</p>
				</a>
				{/* bottom 2 */}
				<a href="" className={cn(baseClassName)} target="_blank">
					<img src="/gcontact.webp" alt="wp-gen-1" className="w-8" />
					<p className="font-medium opacity-45">Google Contact</p>
				</a>
				<a href="" className={cn(baseClassName)} target="_blank">
					<Download className="size-9 opacity-75" />
					<p className="font-medium opacity-45">Save on phone</p>
				</a>
				<ShareLink
					sharelink={getBaseUrl(
						`?phone=${wpData?.phone}&countryDialCode=${wpData?.countryDialCode}&name=${wpData?.name}`,
					)}
					wplink={wpData?.wpLink || ""}
				>
					<Button
						className={cn(
							baseClassName,
							"col-span-2 min-h-[46px] flex-row text-base",
						)}
					>
						Share link
					</Button>
				</ShareLink>
			</div>
		</div>
	);
}
