"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { StoredWpData } from "@/types/wpData";
import {
	buildHistoryCsv,
	mergeHistoryImport,
	parseHistoryCsv,
} from "@/lib/utils/wp-gen";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	FileUpload,
	FileUploadDropzone,
	FileUploadItem,
	FileUploadItemDelete,
	FileUploadItemMetadata,
	FileUploadItemPreview,
	FileUploadList,
	FileUploadTrigger,
	useFileUpload,
} from "@/components/ui/file-upload";
import { X } from "lucide-react";

type TImportHistory = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	history: StoredWpData[];
	setHistory: (value: StoredWpData[]) => void;
	defaultMessage?: string;
};

function ImportCsvFileList() {
	const files = useFileUpload((state) => Array.from(state.files.keys()));

	return (
		<FileUploadList className="w-full">
			{files.map((file, index) => (
				<FileUploadItem
					key={`${index}-${file.name}-${file.size}-${file.lastModified}`}
					value={file}
					className="bg-card/60 border-border/80"
				>
					<FileUploadItemPreview />
					<FileUploadItemMetadata size="sm" />
					<FileUploadItemDelete
						type="button"
						className="text-muted-foreground hover:text-foreground shrink-0 rounded-md p-1.5 hover:bg-accent"
						aria-label="Remove file"
					>
						<X className="size-4" />
					</FileUploadItemDelete>
				</FileUploadItem>
			))}
		</FileUploadList>
	);
}

const IMPORT_MAX_FILES = 30;

export function ImportHistory({
	open,
	onOpenChange,
	history,
	setHistory,
	defaultMessage,
}: TImportHistory) {
	const [csvText, setCsvText] = useState("");
	const [parseError, setParseError] = useState<string | null>(null);
	const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
	const prevUploadCountRef = useRef(0);
	const manualUnlinkFilesRef = useRef(false);

	useEffect(() => {
		if (open) {
			setUploadedFiles([]);
			setParseError(null);
		}
	}, [open]);

	const filesFingerprint = useMemo(
		() =>
			uploadedFiles
				.map((f) => `${f.name}:${f.size}:${f.lastModified}`)
				.join("|"),
		[uploadedFiles],
	);

	useEffect(() => {
		const n = uploadedFiles.length;

		if (n === 0) {
			if (
				prevUploadCountRef.current > 0 &&
				!manualUnlinkFilesRef.current
			) {
				setCsvText("");
				setParseError(null);
			}
			manualUnlinkFilesRef.current = false;
			prevUploadCountRef.current = 0;
			return;
		}

		prevUploadCountRef.current = n;
		let cancelled = false;

		void (async () => {
			const merged: StoredWpData[] = [];
			const errors: string[] = [];
			for (const file of uploadedFiles) {
				if (cancelled) return;
				try {
					const text = await file.text();
					const r = parseHistoryCsv(text);
					if (r.ok) {
						merged.push(...r.entries);
					} else {
						errors.push(`${file.name}: ${r.error}`);
					}
				} catch {
					errors.push(`${file.name}: could not read file`);
				}
			}
			if (cancelled) return;
			setCsvText(buildHistoryCsv(merged));
			setParseError(errors.length > 0 ? errors.join("\n") : null);
		})();

		return () => {
			cancelled = true;
		};
	}, [filesFingerprint]);

	const handleImport = () => {
		const result = parseHistoryCsv(csvText);
		if (!result.ok) {
			setParseError(result.error);
			return;
		}
		setHistory(mergeHistoryImport(history, result.entries, defaultMessage));
		setCsvText("");
		setUploadedFiles([]);
		setParseError(null);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[min(90vh,640px)] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Import history</DialogTitle>
					<DialogDescription>
						Paste CSV, or add one or more export files (combined in order). Rows
						merge into your existing history (same rules as adding links).
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<Label htmlFor="import-csv-paste">Paste CSV</Label>
						<textarea
							id="import-csv-paste"
							value={csvText}
							onChange={(e) => {
								manualUnlinkFilesRef.current = true;
								setCsvText(e.target.value);
								setParseError(null);
								setUploadedFiles([]);
							}}
							placeholder={`name,phone,wpLink,createdAt\n"Ada","+1…",https://wa.me/…,2026-01-01T…`}
							rows={8}
							spellCheck={false}
							className={cn(
								"placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
								"border-input w-full resize-y rounded-md border bg-transparent px-3 py-2 font-mono text-sm shadow-xs outline-none",
								"focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
								"disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
							)}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<Label id="import-csv-file-label">Upload or drop</Label>
						<FileUpload
							accept=".csv,.txt,text/csv,text/plain,application/csv,application/vnd.ms-excel"
							value={uploadedFiles}
							onValueChange={setUploadedFiles}
							maxFiles={IMPORT_MAX_FILES}
							maxSize={512 * 1024}
							multiple
							aria-labelledby="import-csv-file-label"
						>
							<div className="flex flex-col gap-3 rounded-lg border border-border/80 bg-muted/20 p-3">
								<FileUploadDropzone
									aria-labelledby="import-csv-file-label"
									className="min-h-[100px] rounded-md border-2 border-dashed border-border/60 bg-transparent py-3"
								>
									<p className="text-center text-muted-foreground text-sm">
										Drop CSVs here, click to browse (multiple), or paste a file
										while this area is focused. Removing a file updates the
										preview above.
									</p>
									<FileUploadTrigger asChild>
										<Button type="button" variant="outline" size="sm">
											Choose files
										</Button>
									</FileUploadTrigger>
								</FileUploadDropzone>
								<ImportCsvFileList />
							</div>
						</FileUpload>
					</div>

					{parseError ? (
						<p className="text-destructive text-sm" role="alert">
							{parseError}
						</p>
					) : null}
				</div>

				<DialogFooter className="gap-2 sm:gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button type="button" onClick={handleImport}>
						Import
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
