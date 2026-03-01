import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type TWPGen = {
	className?: string;
};

export function WPGen({ className }: TWPGen) {
	return (
		<div className={cn("", className)}>
			<div></div>
		</div>
	);
}
