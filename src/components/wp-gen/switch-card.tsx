import { Label } from "@radix-ui/react-label";
import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";

type TSwitchCard = {
	className?: string;
	children: React.ReactNode;
	id: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
};

export function SwitchCard({
	className,
	children,
	id,
	checked,
	onCheckedChange,
}: TSwitchCard) {
	return (
		<div
			className={cn(
				"group flex h-[66px] place-items-center items-center justify-between gap-8 rounded-md bg-muted/65 p-4 px-6 transition-colors duration-200 hover:bg-muted",
				className,
			)}
		>
			<Label htmlFor={id} className="cursor-pointer font-medium opacity-90">
				{children}
			</Label>
			<Switch
				id={id}
				checked={checked}
				onCheckedChange={(v) => onCheckedChange(v)}
			/>
		</div>
	);
}
