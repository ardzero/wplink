import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { wpData } from "@/types/wpData";
import {
	matchDialCodeFromPhone,
	sanitizePhoneInput,
} from "@/lib/utils/numberUtils";
import { parseAsBoolean, useUrlParam } from "@/hooks/useUrlParam";

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
	// const [countryDialCode, setCountryDialCode] = useState<string | undefined>(
	// 	undefined,
	// );

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const number = phone;
		if (!number) return;
		const countryDialCode = matchDialCodeFromPhone(number);
		setWpData({
			phone: number,
			wpLink: "",
			name: "",
			countryDialCode: countryDialCode || undefined,
		});
		setCompleted(true);
	};

	const handleReset = () => {
		setPhone("");
		setName("");
		setWpData(null);
		setCompleted(false);
	};

	return (
		<div
			className={cn("container flex flex-col gap-12 align-middle", className)}
		>
			<WPNav />
			<form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
				<div className="flex w-full justify-end gap-2 align-bottom">
					<div className="w-full grow basis-1/2">
						<label htmlFor="name">
							Name <span className="text-muted-foreground/65">(optional)</span>
						</label>
						<input
							disabled={completed}
							aria-disabled={completed}
							tabIndex={completed ? -1 : 0}
							value={name}
							onChange={(e) => setName(e.target.value)}
							id="name"
							name="name"
							type="text"
							placeholder="John Doe"
							className={cn(
								"no-autofill-bg w-full rounded-md border-none bg-card py-3.5 pr-12 pl-4 text-base ring-muted outline-none focus-visible:ring-1",
								completed && "pointer-events-none text-muted-foreground/65",
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
									"pointer-events-none text-muted-foreground/65 focus-visible:text-muted-foreground/65",
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
						// className={cn(
						// 	"relative z-10 h-full min-w-[40px] rounded-md bg-rose-500/50 text-foreground/85",
						// 	!completed
						// 		? "pointer-events-none opacity-65"
						// 		: "hover:bg-rose-500/55 hover:text-foreground",
						// )}
						className="h-full min-w-[40px]"
						disabled={!completed}
						variant={"destructive"}
						onClick={handleReset}
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
