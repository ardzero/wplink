import { useCallback } from "react";
import { useStore } from "@nanostores/react";
import { createPersistentStore } from "@/lib/storage/createPersistentStore";

export type UseStorageOptions<T> = {
	default: T;
};

/**
 * Persistent storage hook. Same key stays in sync across components and tabs.
 * Returns [value, setValue, remove]. remove() resets the store to options.default.
 */
export function useStorage<T>(
	key: string,
	options: UseStorageOptions<T>,
): [T, (value: T) => void, () => void] {
	const store = createPersistentStore(key, options.default);
	const value = useStore(store) as T;
	const setValue = useCallback(
		(v: T) => store.set(v),
		[store],
	);
	const remove = useCallback(
		() => store.set(options.default),
		[store, options.default],
	);
	return [value, setValue, remove];
}
