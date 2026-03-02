import { useCallback, useEffect, useSyncExternalStore } from "react";

function getSearchParams() {
	return new URLSearchParams(
		typeof window !== "undefined" ? window.location.search : "",
	);
}

function subscribeToUrl(cb: () => void) {
	window.addEventListener("popstate", cb);
	return () => window.removeEventListener("popstate", cb);
}

type UseUrlParamOptions = {
	/** Use same fn for read and write (e.g. sanitize). */
	transform?: (value: string) => string;
	/** Transform when reading from URL (overrides transform if set). */
	parse?: (value: string) => string;
	/** Transform before writing to URL (overrides transform if set). */
	serialize?: (value: string) => string;
};

/**
 * Syncs state with a URL search param. Reads on mount; updates URL (replaceState) on set.
 * Shared links with ?key=value will have value available on load.
 * Use transform (or parse/serialize) to normalize so URL and UI stay in sync.
 */
export function useUrlParam(
	paramKey: string,
	options?: UseUrlParamOptions,
): [string, (value: string) => void] {
	const noop = (v: string) => v;
	const parse = options?.parse ?? options?.transform ?? noop;
	const serialize = options?.serialize ?? options?.transform ?? noop;

	const getSnapshot = useCallback(() => {
		const raw = getSearchParams().get(paramKey) ?? "";
		return parse(raw);
	}, [paramKey, parse]);

	const getServerSnapshot = useCallback(
		() => parse(getSearchParams().get(paramKey) ?? ""),
		[paramKey, parse],
	);

	const value = useSyncExternalStore(
		subscribeToUrl,
		getSnapshot,
		getServerSnapshot,
	);

	const setValue = useCallback(
		(newVal: string) => {
			const serialized = serialize(newVal);
			const url = new URL(window.location.href);
			if (serialized) url.searchParams.set(paramKey, serialized);
			else url.searchParams.delete(paramKey);
			window.history.replaceState(null, "", url.toString());
			window.dispatchEvent(new PopStateEvent("popstate"));
		},
		[paramKey, serialize],
	);

	// On load: if param exists and transform changes it, rewrite URL to sanitized value
	useEffect(() => {
		if (typeof window === "undefined") return;
		const raw = getSearchParams().get(paramKey) ?? "";
		if (!raw) return;
		const normalized = parse(raw);
		if (normalized !== raw) setValue(normalized);
	}, [paramKey, parse, setValue]);

	return [value, setValue];
}
