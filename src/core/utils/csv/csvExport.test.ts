import { describe, expect, it } from 'vitest';
import {
  type ApplicationExportRow,
  buildApplicationsCsv,
  buildCsvFilename,
  buildMembersCsv,
  type MemberExportRow,
  normalizeEmailCell,
  toCsv,
} from './csvExport';

// Helper: parse CSV back to a 2D array (RFC-4180 aware)
function parseCsv(text: string): string[][] {
  // Strip BOM
  const stripped = text.startsWith('﻿') ? text.slice(1) : text;
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuote = false;
  let i = 0;
  // Normalize CRLF
  const s = stripped.replace(/\r\n/g, '\n');
  while (i < s.length) {
    const ch = s[i];
    if (inQuote) {
      if (ch === '"') {
        if (s[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuote = false;
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') {
        inQuote = true;
      } else if (ch === ',') {
        row.push(cell);
        cell = '';
      } else if (ch === '\n') {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = '';
      } else {
        cell += ch;
      }
    }
    i++;
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter(r => r.length > 0 && !(r.length === 1 && r[0] === ''));
}

describe('normalizeEmailCell', () => {
  it('C1: sentinel variants → empty string', () => {
    expect(normalizeEmailCell('not accessible')).toBe('');
    expect(normalizeEmailCell('Not Accessible')).toBe('');
    expect(normalizeEmailCell('  NOT ACCESSIBLE  ')).toBe('');
    expect(normalizeEmailCell('')).toBe('');
    expect(normalizeEmailCell(undefined)).toBe('');
    expect(normalizeEmailCell(null)).toBe('');
  });

  it('C1: sentinel literal never appears in CSV output', () => {
    const rows: MemberExportRow[] = [
      { displayName: 'Alice', email: 'not accessible' },
      { displayName: 'Bob', email: 'NOT ACCESSIBLE' },
    ];
    const csv = buildMembersCsv(rows);
    expect(csv.toLowerCase()).not.toContain('not accessible');
  });
});

describe('toCsv round-trip', () => {
  it('C2: RFC-4180 round-trip (commas, quotes, CR, LF)', () => {
    const fixtures = [
      ['name', 'value'],
      ['has,comma', 'plain'],
      ['has"quote', 'end"'],
      ['has\rcr', 'x'],
      ['has\nlf', 'y'],
    ];
    const csv = toCsv(fixtures[0], fixtures.slice(1));
    const parsed = parseCsv(csv);
    // header + 4 data rows
    expect(parsed.length).toBe(5);
    expect(parsed[1][0]).toBe('has,comma');
    expect(parsed[2][0]).toBe('has"quote');
    expect(parsed[2][1]).toBe('end"');
    expect(parsed[3][0]).toBe('has\rcr');
    expect(parsed[4][0]).toBe('has\nlf');
  });

  it('C2: BOM is present at byte 0', () => {
    const csv = toCsv(['a'], [['1']]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });
});

describe('injection neutralization', () => {
  it('C3: injection chars get prefixed apostrophe', () => {
    const rows: MemberExportRow[] = [
      { displayName: '=cmd', email: 'safe@example.com' },
      { displayName: '+1', email: undefined },
      { displayName: '-1', email: undefined },
      { displayName: '@x', email: undefined },
      { displayName: '\t x', email: undefined },
      { displayName: '\r x', email: undefined },
    ];
    const csv = buildMembersCsv(rows);
    const parsed = parseCsv(csv);
    // Header is row 0; data starts at row 1
    expect(parsed[1][0]).toBe("'=cmd");
    expect(parsed[2][0]).toBe("'+1");
    expect(parsed[3][0]).toBe("'-1");
    expect(parsed[4][0]).toBe("'@x");
    expect(parsed[5][0]).toBe("'\t x");
    expect(parsed[6][0]).toBe("'\r x");
  });
});

describe('BOM + unicode fidelity', () => {
  it('C4: Cyrillic and CJK preserved', () => {
    const rows: MemberExportRow[] = [
      { displayName: 'Петър "Пешо" Иванов', email: 'p@example.com' },
      { displayName: '渡辺', email: undefined },
    ];
    const csv = buildMembersCsv(rows);
    const parsed = parseCsv(csv);
    expect(parsed[1][0]).toBe('Петър "Пешо" Иванов');
    expect(parsed[2][0]).toBe('渡辺');
  });
});

describe('buildApplicationsCsv', () => {
  it('C5: unanswered questions → empty cell, no shifting', () => {
    const apps: ApplicationExportRow[] = [
      {
        displayName: 'Alice',
        email: 'alice@example.com',
        questions: [
          { name: 'Q1', value: 'Answer1' },
          { name: 'Q2', value: '' },
          { name: 'Q3', value: 'Answer3' },
        ],
        createdDate: '2026-01-01T00:00:00.000Z',
      },
    ];
    const csv = buildApplicationsCsv(apps);
    const parsed = parseCsv(csv);
    // Header: displayName,email,Q1,Q2,Q3,createdDate
    expect(parsed[0]).toEqual(['displayName', 'email', 'Q1', 'Q2', 'Q3', 'createdDate']);
    expect(parsed[1]).toEqual(['Alice', 'alice@example.com', 'Answer1', '', 'Answer3', '2026-01-01T00:00:00.000Z']);
  });

  it('C6: duplicate question names — same column, within-app last value wins', () => {
    const apps: ApplicationExportRow[] = [
      {
        displayName: 'Alice',
        email: undefined,
        questions: [
          { name: 'Hobbies', value: 'first' },
          { name: 'Hobbies', value: 'last' },
        ],
        createdDate: '2026-01-01T00:00:00.000Z',
      },
    ];
    const csv = buildApplicationsCsv(apps);
    const parsed = parseCsv(csv);
    // Header should have only one 'Hobbies' column
    const headerIdx = parsed[0].indexOf('Hobbies');
    expect(headerIdx).toBeGreaterThan(-1);
    expect(parsed[0].filter(h => h === 'Hobbies').length).toBe(1);
    // Value should be 'last'
    expect(parsed[1][headerIdx]).toBe('last');
  });

  it('C6: cross-app same question name → same column', () => {
    const apps: ApplicationExportRow[] = [
      {
        displayName: 'Alice',
        email: 'a@x.com',
        questions: [{ name: 'Motivation', value: 'A motivation' }],
        createdDate: '2026-01-01T00:00:00.000Z',
      },
      {
        displayName: 'Bob',
        email: 'b@x.com',
        questions: [{ name: 'Motivation', value: 'B motivation' }],
        createdDate: '2026-01-02T00:00:00.000Z',
      },
    ];
    const csv = buildApplicationsCsv(apps);
    const parsed = parseCsv(csv);
    const motivationIdx = parsed[0].indexOf('Motivation');
    expect(motivationIdx).toBeGreaterThan(-1);
    expect(parsed[1][motivationIdx]).toBe('A motivation');
    expect(parsed[2][motivationIdx]).toBe('B motivation');
  });

  it('C7: empty dataset → header only for applications', () => {
    const csv = buildApplicationsCsv([]);
    const parsed = parseCsv(csv);
    expect(parsed.length).toBe(1);
    expect(parsed[0]).toEqual(['displayName', 'email', 'createdDate']);
  });

  it('C8: ISO createdDate passthrough', () => {
    const apps: ApplicationExportRow[] = [
      {
        displayName: 'Alice',
        email: 'a@x.com',
        questions: [],
        createdDate: '2026-08-17T09:30:00.000Z',
      },
    ];
    const csv = buildApplicationsCsv(apps);
    const parsed = parseCsv(csv);
    const dateIdx = parsed[0].indexOf('createdDate');
    expect(parsed[1][dateIdx]).toBe('2026-08-17T09:30:00.000Z');
  });
});

describe('buildMembersCsv', () => {
  it('C7: empty dataset → header only for members', () => {
    const csv = buildMembersCsv([]);
    const parsed = parseCsv(csv);
    expect(parsed.length).toBe(1);
    expect(parsed[0]).toEqual(['displayName', 'email']);
  });
});

describe('buildCsvFilename', () => {
  it('C9: generates correct filename', () => {
    const d = new Date('2026-08-17T00:00:00.000Z');
    expect(buildCsvFilename('My Space!', 'members', d)).toBe('my-space-members-2026-08-17.csv');
    expect(buildCsvFilename('My Space!', 'applications', d)).toBe('my-space-applications-2026-08-17.csv');
  });

  it('C9: slug fallback to "space" when undefined', () => {
    const d = new Date('2026-08-17T00:00:00.000Z');
    expect(buildCsvFilename(undefined, 'members', d)).toBe('space-members-2026-08-17.csv');
  });

  it('C9: slug fallback to "space" when empty string after slugify', () => {
    const d = new Date('2026-08-17T00:00:00.000Z');
    expect(buildCsvFilename('!!!', 'members', d)).toBe('space-members-2026-08-17.csv');
  });
});
