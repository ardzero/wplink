import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCountryByDialCode } from "@/lib/data/countryCodes";
import { matchDialCodeFromPhone } from "@/lib/utils/numberUtils";

type TFlag = {
	phone: string;
	className?: string;
};

export function FlagIcon({ className, phone }: TFlag) {
	const countryDialCode = matchDialCodeFromPhone(phone);
	const country = countryDialCode
		? getCountryByDialCode(countryDialCode)
		: null;
	// if (!countryDialCode) return null;
	return (
		<Avatar className={cn("size-5", className)} title={country?.country}>
			<AvatarImage
				src={`/flags/${country?.code}.svg`}
				alt={country?.country}
				className={cn(
					"h-full w-full object-cover",
					countryDialCode === "+880" && "object-[35%]",
				)}
			/>

			<AvatarFallback className="bg-foreground/10">?</AvatarFallback>
		</Avatar>
	);
}
