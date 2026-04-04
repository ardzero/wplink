import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";

function getSearchParams() {
	return new URLSearchParams(
		typeof window !== "undefined" ? window.location.search : "",
	);
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

	// URL is synced on every keystroke, but reading it only after a deferred popstate
	// made the controlled input one tick behind React — cursor jumped to the end.
	// Local state updates synchronously in setValue; we still sync from the URL on
	// popstate (back/forward) and after mount (Astro / SSR default → real ?query).
	const [value, setValueState] = useState<T>(() => parser.default);

	const readFromUrl = useCallback((): T => {
		const raw = getSearchParams().get(paramKey);
		return raw !== null ? parser.parse(raw) : parser.default;
	}, [paramKey, parser]);

	useLayoutEffect(() => {
		if (typeof window === "undefined") return;
		const sync = () => setValueState(readFromUrl());
		sync();
		window.addEventListener("popstate", sync);
		return () => window.removeEventListener("popstate", sync);
	}, [readFromUrl]);

	const setValue = useCallback(
		(newVal: T) => {
			setValueState(newVal);
			if (typeof window === "undefined") return;
			const serialized = parser.serialize(newVal);
			const url = new URL(window.location.href);
			if (serialized) url.searchParams.set(paramKey, serialized);
			else url.searchParams.delete(paramKey);
			window.history.replaceState(null, "", url.toString());
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
