import { useEffect, useRef } from 'react';

/**
 * The one write path of a row-list editor whose writes can land after an upload settles.
 * `rowsRef` mirrors `rows` for post-await reads, so a slow upload never reverts keystrokes typed
 * meanwhile. `commit` writes nothing after unmount, refreshes the mirror first so two uploads
 * settling before the next render each build on the other's result, and calls the host's latest
 * `onChange` — hosts that merge rows into a whole form value hand in a new one per render, and a
 * stale one would revert their other fields.
 */
export function useRowsCommit<Row>(rows: Row[], onChange: (rows: Row[]) => void) {
  const rowsRef = useRef(rows);
  const onChangeRef = useRef(onChange);
  const mounted = useRef(false);
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const commit = (next: Row[]) => {
    if (!mounted.current) return;
    rowsRef.current = next;
    onChangeRef.current(next);
  };

  return { rowsRef, commit };
}
