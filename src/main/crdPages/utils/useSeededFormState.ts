import { useEffect, useRef, useState } from 'react';

type UseSeededFormStateParams<T> = {
  /** Stable identity of the source (e.g. the entity id, or `'new'` for create). */
  seedKey: string;
  /** Whether the source data is final and ready to seed from. */
  ready: boolean;
  /** Produces the seed values from the (loaded) source. Called once per `seedKey`. */
  computeSeed: () => T;
  /** Values shown before the source is ready. */
  empty: T;
};

/**
 * Seeds editable form state from a loaded source, **re-seeding whenever the
 * source identity (`seedKey`) changes**. React Router reuses the same element
 * instance across param changes, so without this a single edit page would keep
 * the previous target's data when navigated to a different target — saving then
 * writes one entity's data onto another. Tracks dirtiness against the seeded
 * snapshot. (Dirty comparison uses `JSON.stringify`, so `T` must be JSON-safe.)
 */
export function useSeededFormState<T>({ seedKey, ready, computeSeed, empty }: UseSeededFormStateParams<T>) {
  const [values, setValues] = useState<T>(empty);
  const [initialJson, setInitialJson] = useState<string>(() => JSON.stringify(empty));
  const seededKeyRef = useRef<string | null>(null);

  const computeSeedRef = useRef(computeSeed);
  computeSeedRef.current = computeSeed;

  useEffect(() => {
    if (!ready || seededKeyRef.current === seedKey) return;
    seededKeyRef.current = seedKey;
    const seeded = computeSeedRef.current();
    setValues(seeded);
    setInitialJson(JSON.stringify(seeded));
  }, [seedKey, ready]);

  return {
    values,
    setValues,
    isDirty: JSON.stringify(values) !== initialJson,
    /** True once the current `seedKey` has been seeded — gate the form render on this. */
    seeded: seededKeyRef.current === seedKey,
  };
}
