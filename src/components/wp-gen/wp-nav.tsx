import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { History } from "./history";
import { Settings } from "./settings";
import { HistoryIcon } from "lucide-react";
import { Cog } from "lucide-react";

type TWPNav = {
	className?: string;
};

const baseClassName =
	"flex min-h-[180px] w-full flex-col items-center justify-center align-middle text-center justify-items-center gap-3 rounded-md bg-card hover:bg-muted transition-colors duration-200 text-foreground group";

export function WPNav({ className }: TWPNav) {
	return (
		<nav
			className={cn(
				"flex flex-wrap place-items-center justify-between gap-6",
				className,
			)}
		>
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
	);
}
