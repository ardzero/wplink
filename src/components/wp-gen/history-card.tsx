import { cn, getBaseUrl } from "@/lib/utils";
import type { wpData } from "@/types/wpData";
import { FlagIcon } from "./flag";
import { EyeIcon, Trash2 } from "lucide-react";

const blurClass = "blur-xs hover:blur-none";

type THistoryCard = wpData & {
	className?: string;
	onDelete?: () => void;
	blurNumber?: boolean;
	blurName?: boolean;
};

export function HistoryCard({
	className,
	phone,
	name,
	onDelete,
	blurNumber = true,
	blurName = true,
}: THistoryCard) {
	const contactLink = getBaseUrl(`?p=${phone}&n=${name ?? ""}&c=true`);
	return (
		<a
			href={contactLink}
			className={cn(
				"group flex h-[66px] place-items-center items-center justify-between gap-8 rounded-md bg-muted/65 p-6 transition-colors duration-200 hover:bg-muted",
				className,
			)}
		>
			<div className="flex items-center gap-4">
				<FlagIcon phone={phone} className="size-5" />
				<div>
					<p
						className={cn(
							"font-medium",
							blurNumber && blurClass,
						)}
					>
						{phone}
					</p>
					{name && (
						<p
							className={cn(
								"text-sm text-muted-foreground",
								blurName && blurClass,
							)}
						>
							{name}
						</p>
					)}
				</div>
			</div>
			<div className="flex items-center gap-2">
				{onDelete && (
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onDelete();
						}}
						className="rounded p-1.5 text-muted-foreground opacity-35 transition-colors hover:bg-destructive/15 hover:text-destructive hover:opacity-100"
						aria-label="Delete from history"
					>
						<Trash2 className="size-4.5" />
					</button>
				)}
				<EyeIcon className="size-4.5 opacity-35 transition-opacity duration-200 group-hover:opacity-100" />
			</div>
		</a>
	);
}
