import { cn } from "@/lib/utils";

type THistoryCard = {
	className?: string;
	phone: string;
	name: string;
	wpLink: string;
	country: string;
};

export function HistoryCard({
	className,
	phone,
	name,
	wpLink,
	country,
}: THistoryCard) {
	return (
		<a href={wpLink} className={cn("flex flex-col gap-2", className)}>
			<p>{phone}</p>
			<p>{name}</p>
			<p>{wpLink}</p>
			<p>{country}</p>
		</a>
	);
}
