import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
type TCopyButton = {
	className?: string;
	text: string;
	id: string;
	content: string;
};

export function CopyButton({ className, text, id, content }: TCopyButton) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(content);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<Button
			id={id}
			className={cn(
				"size-[44px] rounded-md bg-primary/65 text-base text-primary-foreground hover:bg-primary/90",
				className,
			)}
			onClick={handleCopy}
			disabled={copied}
		>
			<div className="relative -mt-0.5 -ml-0.5 size-4">
				<Copy
					strokeWidth={2}
					className={`absolute inset-0 transition-all duration-200 ${
						copied
							? "scale-50 rotate-90 opacity-0"
							: "scale-100 rotate-0 opacity-100"
					}`}
				/>
				<Check
					strokeWidth={3}
					className={`absolute inset-0 transition-all duration-200 ${
						copied
							? "scale-100 rotate-0 opacity-100"
							: "scale-50 -rotate-90 opacity-0"
					}`}
				/>
			</div>
			<span className="sr-only">{text}</span>
		</Button>
	);
}
