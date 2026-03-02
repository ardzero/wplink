import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCountryByDialCode } from "@/lib/data/countryCodes";

type TFlag = {
	countryDialCode?: string;
	className?: string;
};

export function FlagIcon({ className, countryDialCode }: TFlag) {
	const country = countryDialCode
		? getCountryByDialCode(countryDialCode)
		: null;
	// if (!countryDialCode) return null;
	return (
		<Avatar className={cn("size-5", className)} title={country?.country}>
			<AvatarImage
				src={`/flags/${country?.code}.svg`}
				alt={countryDialCode}
				className={cn(
					"h-full w-full object-cover",
					countryDialCode === "+880" && "object-[35%]",
				)}
			/>

			<AvatarFallback className="bg-foreground/10">?</AvatarFallback>
		</Avatar>
	);
}
