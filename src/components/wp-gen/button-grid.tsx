import { cn, getBaseUrl } from "@/lib/utils";
import { Button } from "../ui/button";
import { ShareLink } from "./share-link";
import type { wpData } from "@/types/wpData";
import { Download } from "lucide-react";

type TButtonGrid = {
	wpData?: wpData | null;
	className?: string;
	disabled?: boolean;
};
const baseClassName =
	"flex min-h-[180px] w-full flex-col items-center justify-center align-middle text-center justify-items-center gap-3 rounded-md bg-card hover:bg-muted transition-colors duration-200 text-foreground group";

export function ButtonGrid({ className, wpData, disabled }: TButtonGrid) {
	return (
		<div className={cn("", className)}>
			<div
				className={cn(
					"grid grid-cols-2 gap-2 rounded-md bg-background",
					disabled &&
						"pointer-events-none *:pointer-events-none *:opacity-35 dark:*:opacity-25",
				)}
				aria-disabled={disabled}
			>
				<a
					href={wpData?.wpLink}
					className={cn(baseClassName, "col-span-2")}
					target="_blank"
					tabIndex={disabled ? -1 : 0}
					aria-disabled={disabled}
				>
					<img src="/favicon.svg" alt="wp-gen-1" className="size-16" />
					<p className="text-xl font-medium opacity-45">Message on WhatsApp</p>
				</a>
				{/* bottom 2 */}
				<a
					href=""
					className={cn(baseClassName)}
					target="_blank"
					tabIndex={disabled ? -1 : 0}
					aria-disabled={disabled}
				>
					<img src="/gcontact.webp" alt="wp-gen-1" className="w-8" />
					<p className="font-medium opacity-45">Google Contact</p>
				</a>
				<button
					className={cn(baseClassName)}
					tabIndex={disabled ? -1 : 0}
					aria-disabled={disabled}
				>
					<Download className="size-9 opacity-75" />
					<p className="font-medium opacity-45">Save on phone</p>
				</button>
				<ShareLink
					sharelink={getBaseUrl(
						`?phone=${wpData?.phone}&countryDialCode=${wpData?.countryDialCode}&name=${wpData?.name}`,
					)}
					wplink={wpData?.wpLink || ""}
				>
					<Button
						tabIndex={disabled ? -1 : 0}
						aria-disabled={disabled}
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
