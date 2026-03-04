import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

type TPrefill = {
	className?: string;
	children: React.ReactNode;
	id: string;
	checked: boolean;

	onCheckedChange: (checked: boolean) => void;
	message: string;
	onMessageChange: (message: string) => void;
};

export function Prefill({
	className,
	children,
	id,
	checked,
	onCheckedChange,
	message,
	onMessageChange,
}: TPrefill) {
	return (
		<div
			className={cn(
				"group flex h-auto flex-col gap-4 rounded-md bg-muted/65 p-4 px-5 transition-colors duration-200 focus-within:bg-muted hover:bg-muted",
				className,
			)}
		>
			<div className="flex items-center justify-between gap-2">
				<Label
					htmlFor={id}
					className="cursor-pointer text-base font-medium opacity-90"
				>
					{children}
				</Label>
				<Switch
					id={id}
					checked={checked}
					onCheckedChange={(v) => onCheckedChange(v)}
				/>
			</div>
			<AnimatePresence initial={false}>
				{checked && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2, ease: "easeInOut" }}
						className="overflow-hidden"
					>
						<textarea
							value={message}
							onChange={(e) => onMessageChange(e.target.value)}
							placeholder="e.g. Hi, I'm interested in..."
							rows={3}
							className="w-full rounded-sm border-none bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring focus-visible:ring-ring/15 focus-visible:ring-offset-2 focus-visible:outline-none"
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
