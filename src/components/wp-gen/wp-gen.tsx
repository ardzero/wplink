import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ShareLink } from "./share-link";
type TWPGen = {
	className?: string;
};
const baseClassName =
	"flex min-h-[180px] w-full flex-col items-center justify-center align-middle text-center justify-items-center gap-3 rounded-md bg-card hover:bg-muted/65 transition-colors  duration-200";

export function WPGen({ className }: TWPGen) {
	return (
		<div
			className={cn("container flex flex-col gap-12 align-middle", className)}
		>
			<div className="flex flex-wrap gap-3">
				<input
					type="text"
					placeholder="+880-XXXXX XXXXX"
					className="grow rounded-md border-none bg-card px-4 py-3.5 text-base ring-muted outline-none focus-visible:ring-1 sm:max-w-[350px]"
				/>
				<Button className="h-full min-w-[180px] grow rounded-md bg-primary/65 px-4 py-3.5 text-base text-primary-foreground hover:bg-primary/90">
					Generate Links
				</Button>
			</div>
			<div className="grid grid-cols-2 gap-2">
				<a href="" className={cn(baseClassName, "col-span-2")} target="_blank">
					<img src="/favicon.svg" alt="wp-gen-1" className="size-16" />
					<p className="text-xl font-medium opacity-45">Message on WhatsApp</p>
				</a>
				{/* bottom 2 */}
				<a href="" className={cn(baseClassName)} target="_blank">
					<img src="/gcontact.webp" alt="wp-gen-1" className="w-8" />
					<p className="font-medium opacity-45">Google Contact</p>
				</a>
				<a href="" className={cn(baseClassName)} target="_blank">
					<Download className="size-9 opacity-75" />
					<p className="font-medium opacity-45">Save on phone</p>
				</a>
				<ShareLink
					sharelink={
						"https://www.youtube.com/watch?v=jI8bbMfq1e0&list=RDjI8bbMfq1e0&start_radio=1"
					}
				>
					<Button
						className={cn(
							baseClassName,
							"col-span-2 min-h-[46px] flex-row text-base",
						)}
					>
						Share link
					</Button>
				</ShareLink>
			</div>
		</div>
	);
}
