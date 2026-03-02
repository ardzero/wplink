import { cn } from "@/lib/utils";
import {
	Drawer,
	DrawerContent,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStorage } from "@/hooks/useStorage";
import type { StoredWpData } from "@/types/wpData";
import { phoneToDigits } from "@/lib/utils/wp-gen";
import { HistoryCard } from "./history-card";
import { HistoryIcon } from "lucide-react";

type THistory = {
	className?: string;
	children: React.ReactNode;
};

export function History({ className, children }: THistory) {
	const [history, setHistory] = useStorage("wplink_history", {
		default: [] as StoredWpData[],
	});

	const handleDelete = (entry: StoredWpData) => {
		const digits = phoneToDigits(entry.phone);
		setHistory(
			history.filter((e) => phoneToDigits(e.phone) !== digits),
		);
	};

	return (
		<Drawer>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent className={cn("", className)}>
				<div className="container mx-auto min-h-[500px] py-10">
					<div className="mb-4 flex flex-wrap place-items-center justify-between gap-2">
						<h1 className="flex place-items-center items-center gap-2 text-2xl font-medium opacity-45">
							<HistoryIcon className="size-6" strokeWidth={2} />
							<span className="-mt-1">History</span>
						</h1>
					</div>

					<ScrollArea className="relative h-[500px] w-full">
						<div className="flex flex-col gap-4 pb-16">
							{history.map((item) => (
								<HistoryCard
									key={`${item.phone}-${item.createdAt ?? 0}`}
									{...item}
									onDelete={() => handleDelete(item)}
								/>
							))}
						</div>
						<div
							className="pointer-events-none absolute right-0 bottom-0 left-0 h-16 bg-linear-to-t from-background to-transparent"
							aria-hidden="true"
							role="presentation"
						/>
					</ScrollArea>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
