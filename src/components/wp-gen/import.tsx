import { cn } from "@/lib/utils";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogAction,
} from "@/components/ui/alert-dialog";
type TImportHistory = {
	className?: string;
	children: React.ReactNode;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function ImportHistory({
	className,
	open,
	onOpenChange,
}: TImportHistory) {
	return (
		<div className={cn("", className)}>
			<AlertDialog open={open} onOpenChange={onOpenChange}>
				<AlertDialogContent>
					{/* TODO: Add import history */}
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
