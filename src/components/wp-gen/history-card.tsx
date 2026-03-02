import { cn } from "@/lib/utils";
import type { wpData } from "@/types/wpData";
import { FlagIcon } from "./flag";
import { EyeIcon } from "lucide-react";

type THistoryCard = wpData & {
	className?: string;
};

export function HistoryCard({ className, phone, wpLink, name }: THistoryCard) {
	return (
		<a
			href={wpLink}
			className={cn(
				"group flex h-[66px] place-items-center items-center justify-between gap-8 rounded-md bg-muted/65 p-6 transition-colors duration-200 hover:bg-muted",
				className,
			)}
		>
			<div className="flex items-center gap-4">
				<FlagIcon phone={phone} className="size-5" />
				<div>
					<p className="font-medium">{phone}</p>
					{name && <p className="text-sm text-muted-foreground">{name}</p>}
				</div>
			</div>
			<EyeIcon className="size-4.5 opacity-35 transition-opacity duration-200 group-hover:opacity-100" />
		</a>
	);
}
