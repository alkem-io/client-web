export type MemberExportRow = { displayName: string; email: string | undefined };
export type ApplicationExportRow = {
  displayName: string;
  email: string | undefined;
  questions: Array<{ name: string; value: string }>;
  createdDate: string;
};

const SENTINEL = 'not accessible';
const BOM = '﻿';
const CRLF = '\r\n';
const INJECTION_CHARS = new Set(['=', '+', '-', '@', '\t', '\r']);

/** Normalize a raw email cell value per the contract sentinel rule. */
export function normalizeEmailCell(v: string | null | undefined): string {
  if (v == null || v === '') return '';
  if (v.trim().toLowerCase() === SENTINEL) return '';
  return v;
}

/** Neutralize formula injection in a single string value. */
function neutralize(v: string): string {
  if (v.length > 0 && INJECTION_CHARS.has(v[0])) {
    return "'" + v;
  }
  return v;
}

/** Quote a cell value per RFC-4180. */
function quoteCell(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\r') || v.includes('\n')) {
    return '"' + v.replace(/"/g, '""') + '"';
  }
  return v;
}

/** Full pipeline for a single cell: normalize → neutralize → quote. */
function processCell(v: string | null | undefined): string {
  const normalized = normalizeEmailCell(v);
  const neutralized = neutralize(normalized);
  return quoteCell(neutralized);
}

/**
 * Build a CSV string from a header array and rows matrix.
 * Applies BOM prefix and CRLF row terminators per RFC-4180.
 */
export function toCsv(header: string[], rows: string[][]): string {
  const allRows = [header, ...rows];
  return BOM + allRows.map(row => row.map(processCell).join(',')).join(CRLF) + CRLF;
}

/** Build a CSV export of space members. */
export function buildMembersCsv(rows: MemberExportRow[]): string {
  const header = ['displayName', 'email'];
  const dataRows = rows.map(r => [r.displayName, r.email ?? '']);
  return toCsv(header, dataRows);
}

/**
 * Build a CSV export of applications.
 * Union header: fixed lead (displayName, email) + question columns in first-encounter order + tail (createdDate).
 * Within-app duplicate question names: last value wins.
 */
export function buildApplicationsCsv(rows: ApplicationExportRow[]): string {
  // Collect all unique question names in first-encounter order (across all apps)
  const questionNames: string[] = [];
  const questionNameSet = new Set<string>();
  for (const app of rows) {
    for (const q of app.questions) {
      if (!questionNameSet.has(q.name)) {
        questionNameSet.add(q.name);
        questionNames.push(q.name);
      }
    }
  }

  const header = ['displayName', 'email', ...questionNames, 'createdDate'];

  const dataRows = rows.map(app => {
    // Build a map of question name → last value for this app
    const qMap = new Map<string, string>();
    for (const q of app.questions) {
      qMap.set(q.name, q.value);
    }
    const questionValues = questionNames.map(name => qMap.get(name) ?? '');
    return [app.displayName, app.email ?? '', ...questionValues, app.createdDate];
  });

  return toCsv(header, dataRows);
}

/** Build a sanitized filename for the CSV export. */
export function buildCsvFilename(
  spaceDisplayName: string | undefined,
  kind: 'members' | 'applications',
  now: Date
): string {
  const slug =
    spaceDisplayName
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'space';
  const date = now.toISOString().slice(0, 10); // YYYY-MM-DD
  return `${slug}-${kind}-${date}.csv`;
}
