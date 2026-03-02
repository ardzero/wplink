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

type TShareLink = {
	className?: string;
	sharelink: string;
	children: React.ReactNode;
	wplink: string;
};

const pBaseClassName =
	"grow rounded-md border-none bg-card px-4 flex flex-col shrink justify-center h-[44px] w-full truncate sm:text-base! text-sm!";
export function ShareLink({
	className,
	children,
	sharelink,
	wplink,
}: TShareLink) {
	return (
		<Drawer>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent className={cn("", className)}>
				<div className="container mx-auto flex flex-wrap gap-10 py-16 sm:flex-row-reverse sm:flex-nowrap sm:gap-4">
					<div className="flex h-full w-full flex-col justify-between gap-5">
						<div className="w-full">
							<label htmlFor="wplink">WhatsApp Link</label>
							<div className="flex w-full place-items-center gap-2">
								<p
									className={cn(pBaseClassName, "text-lg font-medium")}
									id="wplink"
								>
									{wplink}
								</p>
								<CopyButton
									text="Copy WhatsApp Link"
									id="wplink"
									content={wplink}
								/>
							</div>
						</div>
						<div className="w-full">
							<label htmlFor="contactlink">Contact Link</label>
							<div className="flex w-full place-items-center gap-2">
								<p
									className={cn(pBaseClassName, "text-lg font-medium")}
									id="contactlink"
								>
									{sharelink}
								</p>
								<CopyButton
									text="Copy Contact Link"
									id="contactlink"
									content={sharelink}
								/>
							</div>
						</div>
					</div>

					<Img
						src={getQrCode(sharelink)}
						width={176}
						height={176}
						alt=""
						className="mx-auto aspect-square min-w-[176px] rounded-xl border-3 border-muted"
					/>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
