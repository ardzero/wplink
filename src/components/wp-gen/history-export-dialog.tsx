"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { StoredWpData } from "@/types/wpData";
import { buildHistoryCsv, downloadTextFile } from "@/lib/utils/wp-gen";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

type THistoryExportDialog = {
	history: StoredWpData[];
	children: React.ReactNode;
};

export function HistoryExportDialog({
	history,
	children,
}: THistoryExportDialog) {
	const [open, setOpen] = useState(false);
	const [copyFeedback, setCopyFeedback] = useState<"idle" | "ok" | "err">(
		"idle",
	);

	const csvExport = useMemo(() => buildHistoryCsv(history), [history]);

	const handleExportDownload = () => {
		const n = history.length;
		const day = new Date().toISOString().slice(0, 10);
		downloadTextFile(
			csvExport,
			`wplink-history-${day}.csv`,
			"text/csv;charset=utf-8",
		);
		toast.success(
			n === 1 ? "Exported 1 entry to CSV" : `Exported ${n} entries to CSV`,
		);
		setOpen(false);
	};

	const handleExportCopy = async () => {
		const n = history.length;
		try {
			await navigator.clipboard.writeText(csvExport);
			setCopyFeedback("ok");
			toast.success(
				n === 1
					? "Copied 1 entry to clipboard"
					: `Copied ${n} entries to clipboard`,
			);
			window.setTimeout(() => setCopyFeedback("idle"), 2000);
		} catch {
			setCopyFeedback("err");
			toast.error("Could not copy to clipboard");
			window.setTimeout(() => setCopyFeedback("idle"), 2500);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) setCopyFeedback("idle");
			}}
		>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<b>
							{history.length} {history.length === 1 ? "Entry" : "Entries"}
						</b>{" "}
						ready to be exported.
					</DialogTitle>
					<DialogDescription>
						Download a CSV file or copy the same data to your clipboard{" "}
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
	);
}
