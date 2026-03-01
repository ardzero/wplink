import { cn, getQrCode } from "@/lib/utils";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "../ui/button";

type TShareLink = {
	className?: string;
	sharelink: string;
	children: React.ReactNode;
};

export function ShareLink({ className, children, sharelink }: TShareLink) {
	return (
		<Drawer>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent className={cn("", className)}>
				<div className="container mx-auto mt-10 min-h-[50vh]">
					<img src={getQrCode(sharelink)} alt="" className="mx-auto" />
				</div>
			</DrawerContent>
		</Drawer>
	);
}
