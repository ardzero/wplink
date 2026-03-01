import { cn, getQrCode } from "@/lib/utils";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { CopyButton } from "./copy-btn";
import { Img } from "@/components/utils/react-only/Image";
import { Cog, HistoryIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type TSettings = {
	className?: string;
	children: React.ReactNode;
};

const pBaseClassName =
	"grow rounded-md border-none bg-card px-4 flex flex-col shrink justify-center h-[44px] w-full truncate sm:text-base! text-sm!";
export function Settings({ className, children }: TSettings) {
	return (
		<Drawer>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent className={cn("", className)}>
				<div className="container mx-auto min-h-[500px] py-10">
					<div className="mb-4 flex flex-wrap place-items-center justify-between gap-2">
						<h1 className="flex place-items-center items-center gap-2 text-2xl font-medium opacity-45">
							<Cog className="size-6" strokeWidth={2} />
							<span className="-mt-1">Settings</span>
						</h1>
					</div>
					<ScrollArea className="relative h-[500px] w-full">
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
