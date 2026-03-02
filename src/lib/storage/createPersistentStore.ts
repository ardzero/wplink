import { persistentJSON } from "@nanostores/persistent";
import type { WritableAtom } from "nanostores";

const registry = new Map<string, WritableAtom<unknown>>();

/**
 * Returns a persistent atom for the given key. Same key => same store (single source of truth).
 * Uses JSON (de)serialization so any JSON-serializable type is supported.
 */
export function createPersistentStore<T>(key: string, initial: T): WritableAtom<T> {
	let store = registry.get(key) as WritableAtom<T> | undefined;
	if (!store) {
		store = persistentJSON<T>(key, initial) as WritableAtom<T>;
		registry.set(key, store as WritableAtom<unknown>);
	}
	return store;
}
