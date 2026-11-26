import { useEffect, useRef, useState } from 'react';

let rowIdCounter = 0;
const newRowIds = (count: number) =>
  Array.from({ length: count }, () => {
    rowIdCounter += 1;
    return `row-${rowIdCounter}`;
  });

/**
 * The one write path of a row-list editor whose writes can land after an upload settles.
 *
 * Every row carries a client-only id that lives here, beside the host's rows and never inside
 * them, so hosts map and submit their rows as they always have. The editor makes every add,
 * edit and removal through this hook, so ids follow their rows; a list the host replaces with
 * one of another length (the first render, a reload after Save) gets fresh ids.
 *
 * Writes address a row by id: a write for a row that has been removed changes nothing. Each
 * write builds on the latest rows, so a slow upload never reverts keystrokes typed meanwhile and
 * two uploads settling before the next render each build on the other's result. Nothing is
 * written after unmount, and the host's latest `onChange` is called — hosts that merge rows into
 * a whole form value hand in a new one per render, and a stale one would revert their other fields.
 */
export function useRowsCommit<Row>(rows: Row[], onChange: (rows: Row[]) => void) {
  const [ids, setIds] = useState(() => newRowIds(rows.length));
  let rowIds = ids;
  if (ids.length !== rows.length) {
    rowIds = newRowIds(rows.length);
    setIds(rowIds);
  }
  const latest = useRef({ rows, ids: rowIds });
  const onChangeRef = useRef(onChange);
  const mounted = useRef(false);
  useEffect(() => {
    latest.current = { rows, ids: rowIds };
  }, [rows, rowIds]);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const commit = (nextRows: Row[], nextIds: string[]) => {
    if (!mounted.current) return;
    latest.current = { rows: nextRows, ids: nextIds };
    setIds(nextIds);
    onChangeRef.current(nextRows);
  };

  const rowById = (id: string): Row | undefined => {
    const index = latest.current.ids.indexOf(id);
    return index < 0 ? undefined : latest.current.rows[index];
  };

  const updateRow = (id: string, patch: Partial<Row>) => {
    const { rows: current, ids: currentIds } = latest.current;
    if (!currentIds.includes(id)) return;
    commit(
      current.map((row, i) => (currentIds[i] === id ? { ...row, ...patch } : row)),
      currentIds
    );
  };

  const removeRow = (id: string) => {
    const { rows: current, ids: currentIds } = latest.current;
    commit(
      current.filter((_, i) => currentIds[i] !== id),
      currentIds.filter(rowId => rowId !== id)
    );
  };

  const appendRow = (row: Row) => {
    const { rows: current, ids: currentIds } = latest.current;
    commit([...current, row], [...currentIds, ...newRowIds(1)]);
  };

  return { rowIds, rowById, updateRow, removeRow, appendRow };
}
