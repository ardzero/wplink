import { useState } from "react";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ArrowDownToLine, ArrowUpToLine, Cog, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStorage } from "@/hooks/useStorage";
import { Button } from "@/components/ui/button";
import { SwitchCard } from "@/components/wp-gen/switch-card";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	defaultPrivacySettings,
	WPLINK_PRIVACY_STORAGE_KEY,
	type WplinkPrivacySettings,
	defaultMessageSettings,
	WPLINK_DEFAULT_MESSAGE_STORAGE_KEY,
	type WplinkDefaultMessageSettings,
} from "@/types/wpData";
import { Prefill } from "./prefil";
import { HistoryExportDialog } from "./history-export-dialog";
import { ImportHistory } from "./import";

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
	const [defaultMessage, setDefaultMessage] = useStorage(
		WPLINK_DEFAULT_MESSAGE_STORAGE_KEY,
		{ default: defaultMessageSettings },
	);
	const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
	const [importOpen, setImportOpen] = useState(false);

	const handleClearHistory = () => {
		setHistory([]);
		setClearConfirmOpen(false);
	};

	const updatePrivacy = (patch: Partial<WplinkPrivacySettings>) => {
		setPrivacy({ ...privacy, ...patch });
	};

	const updateDefaultMessage = (
		patch: Partial<WplinkDefaultMessageSettings>,
	) => {
		setDefaultMessage({ ...defaultMessage, ...patch });
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
								<h2 className="mb-2 font-medium opacity-70">WhatsApp link</h2>
								<div className="space-y-2">
									<Prefill
										id="default-message-enabled"
										checked={defaultMessage.enabled}
										onCheckedChange={(v) =>
											updateDefaultMessage({ enabled: v })
										}
										message={defaultMessage.message}
										onMessageChange={(v) =>
											updateDefaultMessage({ message: v })
										}
									>
										Pre-filled WhatsApp message
									</Prefill>
								</div>
							</div>
							<div>
								<h2 className="mb-2 font-medium opacity-70">Data</h2>
								<div className="flex items-center gap-2">
									<Button
										variant="destructive"
										onClick={() => setClearConfirmOpen(true)}
										className="gap-2"
									>
										<Trash2 className="size-4" />
										Clear history
									</Button>

									<HistoryExportDialog history={history}>
										<Button
											variant="secondary"
											type="button"
											className="gap-2"
											aria-label="Export history"
											disabled={history.length === 0}
										>
											<ArrowUpToLine className="size-4" />
											Export history
										</Button>
									</HistoryExportDialog>
									<Button
										variant="secondary"
										type="button"
										aria-label="Import history"
										onClick={() => setImportOpen(true)}
									>
										<ArrowDownToLine className="size-4" /> Import history
									</Button>
									<ImportHistory
										open={importOpen}
										onOpenChange={setImportOpen}
										history={history}
										setHistory={setHistory}
										defaultMessage={
											defaultMessage.enabled
												? defaultMessage.message
												: undefined
										}
									/>
								</div>

								<AlertDialog
									open={clearConfirmOpen}
									onOpenChange={setClearConfirmOpen}
								>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Clear all history?</AlertDialogTitle>
											<AlertDialogDescription>
												This cannot be undone. All your generated link history
												will be permanently removed.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Cancel</AlertDialogCancel>
											<AlertDialogAction
												onClick={handleClearHistory}
												className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
											>
												Clear history
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
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
										id="ultra-privacy"
										checked={privacy.ultraPrivacyMode}
										onCheckedChange={(v) =>
											updatePrivacy({ ultraPrivacyMode: v })
										}
									>
										Ultra privacy (blur all links, names, numbers, including
										input)
									</SwitchCard>
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
