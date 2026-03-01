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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type THistory = {
	className?: string;
	children: React.ReactNode;
};

const pBaseClassName =
	"grow rounded-md border-none bg-card px-4 flex flex-col shrink justify-center h-[44px] w-full truncate sm:text-base! text-sm!";
export function History({ className, children }: THistory) {
	return (
		<Drawer>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent className={cn("", className)}>
				<div className="container mx-auto min-h-[500px] py-14">
					<h1>History</h1>
					<ScrollArea className="h-[500px] w-full">
						<div className="flex flex-col gap-2"></div>
					</ScrollArea>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
