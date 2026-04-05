import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStorage } from "@/hooks/useStorage";
import type { StoredWpData } from "@/types/wpData";
import {
	defaultPrivacySettings,
	WPLINK_PRIVACY_STORAGE_KEY,
} from "@/types/wpData";
import {
	buildHistoryCsv,
	downloadTextFile,
	phoneToDigits,
} from "@/lib/utils/wp-gen";
import { getCountryByDialCode } from "@/lib/data/countryCodes";
import { matchDialCodeFromPhone } from "@/lib/utils/numberUtils";
import { HistoryCard } from "./history-card";
import { ArrowUpFromLine, HistoryIcon, SearchIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";

type SearchableEntry = StoredWpData & { countryName: string };

type THistory = {
	className?: string;
	children: React.ReactNode;
};

export function History({ className, children }: THistory) {
	const [history, setHistory] = useStorage("wplink_history", {
		default: [] as StoredWpData[],
	});
	const [privacy] = useStorage(WPLINK_PRIVACY_STORAGE_KEY, {
		default: defaultPrivacySettings,
	});
	const [query, setQuery] = useState("");
	const [exportOpen, setExportOpen] = useState(false);
	const [copyFeedback, setCopyFeedback] = useState<"idle" | "ok" | "err">(
		"idle",
	);
	const blurNumber = privacy.blurNumbersInHistory || privacy.ultraPrivacyMode;
	const blurName = privacy.blurNamesInHistory || privacy.ultraPrivacyMode;

	const searchableList = useMemo<SearchableEntry[]>(() => {
		return history.map((entry) => {
			const dialCode = matchDialCodeFromPhone(entry.phone);
			const country = dialCode ? getCountryByDialCode(dialCode) : null;
			return { ...entry, countryName: country?.country ?? "" };
		});
	}, [history]);

	const fuse = useMemo(
		() =>
			new Fuse(searchableList, {
				keys: ["name", "phone", "countryName"],
				threshold: 0.3,
			}),
		[searchableList],
	);

	const filteredHistory = useMemo(() => {
		const q = query.trim();
		if (!q) return searchableList;
		return fuse.search(q).map((r) => r.item);
	}, [query, searchableList, fuse]);

	const handleDelete = (entry: StoredWpData) => {
		const digits = phoneToDigits(entry.phone);
		setHistory(history.filter((e) => phoneToDigits(e.phone) !== digits));
	};

	const csvExport = useMemo(() => buildHistoryCsv(history), [history]);

	const handleExportDownload = () => {
		const day = new Date().toISOString().slice(0, 10);
		downloadTextFile(csvExport, `wplink-history-${day}.csv`, "text/csv;charset=utf-8");
		setExportOpen(false);
	};

	const handleExportCopy = async () => {
		try {
			await navigator.clipboard.writeText(csvExport);
			setCopyFeedback("ok");
			window.setTimeout(() => setCopyFeedback("idle"), 2000);
		} catch {
			setCopyFeedback("err");
			window.setTimeout(() => setCopyFeedback("idle"), 2500);
		}
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
						<div className="flex items-center gap-2">
							<div className="group relative -mt-1 w-full max-w-[240px]">
								<input
									id="history-search"
									name="history-search"
									type="search"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									placeholder="Name, number, country"
									className={cn(
										"no-autofill-bg w-full rounded-md border-none bg-card py-2 pr-8 pl-4 text-sm ring-muted outline-none focus-visible:ring-1",
										"[&::-webkit-search-cancel-button]:hidden",
									)}
								/>
								<SearchIcon className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 opacity-35 transition-opacity duration-200 group-focus-within:opacity-100" />
							</div>
							<Dialog
								open={exportOpen}
								onOpenChange={(open) => {
									setExportOpen(open);
									if (!open) setCopyFeedback("idle");
								}}
							>
								<DialogTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										type="button"
										aria-label="Export history"
										disabled={history.length === 0}
									>
										<ArrowUpFromLine className="size-4" />
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Export history</DialogTitle>
										<DialogDescription>
											Download a CSV file or copy the same data to your
											clipboard ({history.length}{" "}
											{history.length === 1 ? "entry" : "entries"}).
										</DialogDescription>
									</DialogHeader>
									<DialogFooter className="gap-2 sm:gap-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => void handleExportCopy()}
											disabled={history.length === 0}
										>
											{copyFeedback === "ok"
												? "Copied"
												: copyFeedback === "err"
													? "Copy failed"
													: "Copy CSV"}
										</Button>
										<Button
											type="button"
											onClick={handleExportDownload}
											disabled={history.length === 0}
										>
											Download CSV
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</div>
					</div>

					<ScrollArea className="relative h-[500px] w-full">
						<div className="flex flex-col gap-4 pb-16">
							{filteredHistory.map((item) => (
								<HistoryCard
									key={`${item.phone}-${item.createdAt ?? 0}`}
									{...item}
									onDelete={() => handleDelete(item)}
									blurNumber={blurNumber}
									blurName={blurName}
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
