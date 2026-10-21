import { describe, expect, test } from 'vitest';
import { chipIconTint, chipSurfaceTint, type TintedChipKind } from './chipTints';

/** The kinds each strip can show at once — the sets uniqueness has to hold within. */
const FRAMING: TintedChipKind[] = [
  'whiteboard',
  'memo',
  'document',
  'cta',
  'image',
  'poll',
  'contributors',
  'spaces',
  'form',
];
const RESPONSES: TintedChipKind[] = ['link', 'post', 'memo', 'whiteboard', 'document', 'tasks'];

describe('chipTints', () => {
  test.each([
    ['framing', FRAMING],
    ['responses', RESPONSES],
  ])('no two %s chips share a hue — they are visible at the same time', (_name, kinds) => {
    const icons = kinds.map(chipIconTint);
    expect(new Set(icons).size).toBe(kinds.length);
    const surfaces = kinds.map(chipSurfaceTint);
    expect(new Set(surfaces).size).toBe(kinds.length);
  });

  test.each([
    ['whiteboard', 'blue'],
    ['memo', 'purple'],
    ['document', 'teal'],
  ] as const)('%s keeps its %s hue in both strips — the same kind must look the same in each', (kind, hue) => {
    expect(FRAMING).toContain(kind);
    expect(RESPONSES).toContain(kind);
    // Both strips resolve the kind through this one key, so pinning it pins both.
    expect(chipIconTint(kind)).toBe(`text-${hue}-600`);
    expect(chipSurfaceTint(kind)).toBe(`bg-${hue}-100 border-${hue}-300`);
  });

  test('no dark variants — the product has no dark mode to serve them', () => {
    // theme.css defines `.dark`, but nothing in the app ever sets that class.
    // Shipping `dark:` utilities here would assert support that does not exist.
    for (const kind of [...new Set([...FRAMING, ...RESPONSES])]) {
      expect(chipIconTint(kind)).not.toMatch(/dark:/);
      expect(chipSurfaceTint(kind)).not.toMatch(/dark:/);
    }
  });

  test('the surface carries a background and a border, so selection reads as a filled chip', () => {
    for (const kind of [...new Set([...FRAMING, ...RESPONSES])]) {
      expect(chipSurfaceTint(kind)).toMatch(/\bbg-/);
      expect(chipSurfaceTint(kind)).toMatch(/\bborder-/);
    }
  });
});
