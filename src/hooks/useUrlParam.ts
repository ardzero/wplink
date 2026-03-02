import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

function getSearchParams() {
	return new URLSearchParams(
		typeof window !== "undefined" ? window.location.search : "",
	);
}

function subscribeToUrl(cb: () => void) {
	window.addEventListener("popstate", cb);
	return () => window.removeEventListener("popstate", cb);
}

/** Parser for a URL search param: parse from string, serialize to string, default when missing. */
export type UrlParamParser<T> = {
	parse: (value: string) => T;
	serialize: (value: T) => string;
	default: T;
};

/** Legacy options: use parser-based API (parseAsString, parseAsBoolean) instead. */
type UseUrlParamOptionsLegacy = {
	transform?: (value: string) => string;
	parse?: (value: string) => string;
	serialize?: (value: string) => string;
};

function isParser<T>(
	opts: UrlParamParser<T> | UseUrlParamOptionsLegacy,
): opts is UrlParamParser<T> {
	return "default" in opts && "parse" in opts && "serialize" in opts;
}

// --- NuQS-style parsers ---

const identity = (s: string) => s;

export const parseAsString = {
	parse: identity,
	serialize: identity,
	default: "",
	withDefault(defaultValue: string): UrlParamParser<string> {
		return { parse: identity, serialize: identity, default: defaultValue };
	},
};

/** Treats "true", "1", "yes" (case-insensitive) as true; anything else as false. */
function parseBoolean(s: string): boolean {
	const lower = s.toLowerCase();
	return lower === "true" || lower === "1" || lower === "yes";
}

/** Serialize: true -> "true", false -> "" (omit param). */
function serializeBoolean(b: boolean): string {
	return b ? "true" : "";
}

export const parseAsBoolean = {
	parse: parseBoolean,
	serialize: serializeBoolean,
	default: false,
	withDefault(defaultValue: boolean): UrlParamParser<boolean> {
		return {
			parse: parseBoolean,
			serialize: serializeBoolean,
			default: defaultValue,
		};
	},
};

/** Use a transform on both parse and serialize (e.g. sanitize). */
export function withTransform<T>(
	parser: UrlParamParser<T>,
	transform: (s: string) => string,
): UrlParamParser<T> {
	return {
		parse: (s) => parser.parse(transform(s)),
		serialize: (v) => transform(parser.serialize(v)),
		default: parser.default,
	};
}

/**
 * Syncs state with a URL search param. NuQS-style: pass a parser (e.g. parseAsString.withDefault(''), parseAsBoolean.withDefault(false)).
 * Legacy: pass { transform } or { parse, serialize } for string-only; default "".
 */
const legacyParser = (opts: UseUrlParamOptionsLegacy): UrlParamParser<string> => {
	const noop = (v: string) => v;
	const parse = opts?.parse ?? opts?.transform ?? noop;
	const serialize = opts?.serialize ?? opts?.transform ?? noop;
	return { parse, serialize, default: "" };
};

export function useUrlParam<T = string>(
	paramKey: string,
	parserOrOptions: UrlParamParser<T> | UseUrlParamOptionsLegacy,
): [T, (value: T) => void] {
	const parser: UrlParamParser<T> = useMemo(
		() =>
			isParser(parserOrOptions)
				? parserOrOptions
				: (legacyParser(parserOrOptions) as unknown as UrlParamParser<T>),
		[parserOrOptions],
	);

	const getSnapshot = useCallback(() => {
		const raw = getSearchParams().get(paramKey);
		return raw !== null ? parser.parse(raw) : parser.default;
	}, [paramKey, parser]);

	// Always return default so SSR and client hydration match (no window on server).
	// We sync from real URL in useEffect after mount (Astro/React islands).
	const getServerSnapshot = useCallback(
		() => parser.default,
		[parser],
	);

	const value = useSyncExternalStore(
		subscribeToUrl,
		getSnapshot,
		getServerSnapshot,
	);

	// After mount (e.g. Astro island hydration), re-read from real URL so ?c=true etc. apply
	useEffect(() => {
		window.dispatchEvent(new PopStateEvent("popstate"));
	}, []);

	const setValue = useCallback(
		(newVal: T) => {
			const serialized = parser.serialize(newVal);
			const url = new URL(window.location.href);
			if (serialized) url.searchParams.set(paramKey, serialized);
			else url.searchParams.delete(paramKey);
			window.history.replaceState(null, "", url.toString());
			window.dispatchEvent(new PopStateEvent("popstate"));
		},
		[paramKey, parser],
	);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const raw = getSearchParams().get(paramKey);
		if (raw === null) return;
		const parsed = parser.parse(raw);
		const serialized = parser.serialize(parsed);
		if (serialized !== raw) setValue(parsed);
	}, [paramKey, parser, setValue]);

	return [value, setValue];
}
