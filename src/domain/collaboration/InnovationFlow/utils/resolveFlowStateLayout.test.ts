import { describe, expect, test } from 'vitest';
import { CalloutDescriptionDisplayMode } from '@/core/apollo/generated/graphql-schema';
import { resolveFlowStateLayout } from './resolveFlowStateLayout';

const DEFAULTS = { descriptionCollapsed: false, showPublishDetails: true };

const makeState = (
  displayName: string,
  descriptionDisplayMode?: CalloutDescriptionDisplayMode,
  showPublishDetails?: boolean
) => ({
  displayName,
  settings:
    descriptionDisplayMode !== undefined || showPublishDetails !== undefined
      ? {
          descriptionDisplayMode: descriptionDisplayMode ?? null,
          showPublishDetails: showPublishDetails ?? null,
        }
      : null,
});

describe('resolveFlowStateLayout', () => {
  // ─── Match → settings honored ───────────────────────────────────────────────

  test('match with COLLAPSED → descriptionCollapsed: true, showPublishDetails unchanged', () => {
    const states = [makeState('Knowledge Base', CalloutDescriptionDisplayMode.Collapsed, true)];
    expect(resolveFlowStateLayout(states, 'Knowledge Base')).toEqual({
      descriptionCollapsed: true,
      showPublishDetails: true,
    });
  });

  test('match with EXPANDED → descriptionCollapsed: false', () => {
    const states = [makeState('Home', CalloutDescriptionDisplayMode.Expanded, true)];
    expect(resolveFlowStateLayout(states, 'Home')).toEqual({
      descriptionCollapsed: false,
      showPublishDetails: true,
    });
  });

  test('match with showPublishDetails: false → hides author/timestamp', () => {
    const states = [makeState('Contributors', CalloutDescriptionDisplayMode.Expanded, false)];
    expect(resolveFlowStateLayout(states, 'Contributors')).toEqual({
      descriptionCollapsed: false,
      showPublishDetails: false,
    });
  });

  test('match with both COLLAPSED and showPublishDetails false', () => {
    const states = [makeState('Archive', CalloutDescriptionDisplayMode.Collapsed, false)];
    expect(resolveFlowStateLayout(states, 'Archive')).toEqual({
      descriptionCollapsed: true,
      showPublishDetails: false,
    });
  });

  // ─── Miss → defaults ────────────────────────────────────────────────────────

  test('unrecognised tag → defaults', () => {
    const states = [makeState('Home', CalloutDescriptionDisplayMode.Collapsed)];
    expect(resolveFlowStateLayout(states, 'NonExistentPhase')).toEqual(DEFAULTS);
  });

  test('empty-string tag → defaults', () => {
    const states = [makeState('Home', CalloutDescriptionDisplayMode.Collapsed)];
    expect(resolveFlowStateLayout(states, '')).toEqual(DEFAULTS);
  });

  test('undefined tag → defaults', () => {
    const states = [makeState('Home', CalloutDescriptionDisplayMode.Collapsed)];
    expect(resolveFlowStateLayout(states, undefined)).toEqual(DEFAULTS);
  });

  test('null tag → defaults', () => {
    const states = [makeState('Home', CalloutDescriptionDisplayMode.Collapsed)];
    expect(resolveFlowStateLayout(states, null)).toEqual(DEFAULTS);
  });

  // ─── Undefined / empty states → defaults ───────────────────────────────────

  test('undefined states → defaults', () => {
    expect(resolveFlowStateLayout(undefined, 'Home')).toEqual(DEFAULTS);
  });

  test('null states → defaults', () => {
    expect(resolveFlowStateLayout(null, 'Home')).toEqual(DEFAULTS);
  });

  test('empty states array → defaults', () => {
    expect(resolveFlowStateLayout([], 'Home')).toEqual(DEFAULTS);
  });

  // ─── State without settings keys → defaults ─────────────────────────────────

  test('matched state with null settings → defaults', () => {
    const states = [{ displayName: 'Home', settings: null }];
    expect(resolveFlowStateLayout(states, 'Home')).toEqual(DEFAULTS);
  });

  test('matched state with settings but null descriptionDisplayMode → defaults for that key', () => {
    const states = [{ displayName: 'Home', settings: { descriptionDisplayMode: null, showPublishDetails: null } }];
    // null displayMode → not COLLAPSED → descriptionCollapsed: false
    // null showPublishDetails → !== false → showPublishDetails: true
    expect(resolveFlowStateLayout(states, 'Home')).toEqual(DEFAULTS);
  });

  // ─── Enum case sensitivity (the critical enum trap) ─────────────────────────

  test('ENUM TRAP: lowercase "collapsed" never matches — only the enum NAME does', () => {
    // Simulate a hypothetical bug where someone stored a lowercase string
    const states = [
      {
        displayName: 'Home',
        settings: {
          // Cast to force a wrong value through TypeScript's type guard —
          // in production this would never arrive via the generated enum,
          // but the test documents the property.
          descriptionDisplayMode: 'collapsed' as CalloutDescriptionDisplayMode,
          showPublishDetails: true,
        },
      },
    ];
    // 'collapsed' !== CalloutDescriptionDisplayMode.Collapsed ('COLLAPSED')
    // → descriptionCollapsed must be false (the enum trap is NOT triggered)
    expect(resolveFlowStateLayout(states, 'Home').descriptionCollapsed).toBe(false);
  });

  // ─── Never-throws property ──────────────────────────────────────────────────

  test('never throws for any combination of inputs', () => {
    const weirdInputs: Array<[unknown, unknown]> = [
      [undefined, undefined],
      [null, null],
      [[], ''],
      [[{ displayName: '', settings: undefined }], ''],
    ];
    for (const [states, tag] of weirdInputs) {
      expect(() =>
        // Cast to exercise the function with pathological inputs
        resolveFlowStateLayout(states as never, tag as never)
      ).not.toThrow();
    }
  });

  // ─── Multiple states — only the matching one applies ─────────────────────────

  test('multiple states — returns settings only for the matched one', () => {
    const states = [
      makeState('Home', CalloutDescriptionDisplayMode.Expanded, true),
      makeState('Knowledge Base', CalloutDescriptionDisplayMode.Collapsed, false),
    ];
    expect(resolveFlowStateLayout(states, 'Knowledge Base')).toEqual({
      descriptionCollapsed: true,
      showPublishDetails: false,
    });
    expect(resolveFlowStateLayout(states, 'Home')).toEqual({
      descriptionCollapsed: false,
      showPublishDetails: true,
    });
  });
});
