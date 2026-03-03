import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Cog, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStorage } from "@/hooks/useStorage";
import { Button } from "@/components/ui/button";
import { SwitchCard } from "@/components/wp-gen/switch-card";
import {
	defaultPrivacySettings,
	WPLINK_PRIVACY_STORAGE_KEY,
	type WplinkPrivacySettings,
} from "@/types/wpData";

const HISTORY_STORAGE_KEY = "wplink_history";

type TSettings = {
	className?: string;
	children: React.ReactNode;
};

export function Settings({ className, children }: TSettings) {
	const [history, setHistory] = useStorage(HISTORY_STORAGE_KEY, {
		default: [] as import("@/types/wpData").StoredWpData[],
	});
	const [privacy, setPrivacy] = useStorage(WPLINK_PRIVACY_STORAGE_KEY, {
		default: defaultPrivacySettings,
	});

	const handleClearHistory = () => {
		if (
			typeof window !== "undefined" &&
			window.confirm("Clear all history? This cannot be undone.")
		) {
			setHistory([]);
		}
	};

	const updatePrivacy = (patch: Partial<WplinkPrivacySettings>) => {
		setPrivacy({ ...privacy, ...patch });
	};

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
						<div className="mb-14 space-y-6 pr-4">
							<div>
								<h2 className="mb-2 font-medium opacity-70">Data</h2>
								<Button
									variant="destructive"
									onClick={handleClearHistory}
									className="gap-2"
								>
									<Trash2 className="size-4" />
									Clear history
								</Button>
							</div>
							<div>
								<h2 className="mb-2 font-medium opacity-70">
									Privacy{" "}
									<span className="ml-1 text-sm text-muted-foreground">
										Caution: the text get unblurred when you hover over them
									</span>
								</h2>
								<div className="space-y-2">
									<SwitchCard
										id="blur-numbers-history"
										checked={privacy.blurNumbersInHistory}
										onCheckedChange={(v) =>
											updatePrivacy({ blurNumbersInHistory: v })
										}
									>
										Blur numbers in history
									</SwitchCard>
									<SwitchCard
										id="blur-names-history"
										checked={privacy.blurNamesInHistory}
										onCheckedChange={(v) =>
											updatePrivacy({ blurNamesInHistory: v })
										}
									>
										Blur names in history
									</SwitchCard>
									<SwitchCard
										id="blur-name-home"
										checked={privacy.blurNameInHome}
										onCheckedChange={(v) =>
											updatePrivacy({ blurNameInHome: v })
										}
									>
										Blur name in home (when link generated)
									</SwitchCard>
									<SwitchCard
										id="blur-number-home"
										checked={privacy.blurNumberInHome}
										onCheckedChange={(v) =>
											updatePrivacy({ blurNumberInHome: v })
										}
									>
										Blur number in home (when link generated)
									</SwitchCard>
									<SwitchCard
										id="blur-share-links"
										checked={privacy.blurShareLinks}
										onCheckedChange={(v) =>
											updatePrivacy({ blurShareLinks: v })
										}
									>
										Blur share links
									</SwitchCard>
									<SwitchCard
										id="ultra-privacy"
										checked={privacy.ultraPrivacyMode}
										onCheckedChange={(v) =>
											updatePrivacy({ ultraPrivacyMode: v })
										}
									>
										Ultra privacy (blur all links, names, numbers, including
										input)
									</SwitchCard>
								</div>
							</div>
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
