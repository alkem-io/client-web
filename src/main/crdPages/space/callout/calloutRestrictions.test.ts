import { describe, expect, test } from 'vitest';
import {
  clampFormValuesToRestrictions,
  restrictionsForPickedTemplate,
  VC_KNOWLEDGE_BASE_CALLOUT_RESTRICTIONS,
} from './calloutRestrictions';

describe('clampFormValuesToRestrictions', () => {
  test('returns values unchanged when no restrictions are supplied', () => {
    const values = { framingChip: 'whiteboard' as const, responseType: 'memo' as const };
    expect(clampFormValuesToRestrictions(values, undefined)).toEqual(values);
  });

  test('VC preset: a disallowed template framing (whiteboard) is clamped to none', () => {
    const result = clampFormValuesToRestrictions({ framingChip: 'whiteboard' }, VC_KNOWLEDGE_BASE_CALLOUT_RESTRICTIONS);
    expect(result.framingChip).toBe('none');
  });

  test('VC preset: a disallowed template response type (memo/whiteboard) is clamped to none', () => {
    expect(
      clampFormValuesToRestrictions({ responseType: 'memo' }, VC_KNOWLEDGE_BASE_CALLOUT_RESTRICTIONS).responseType
    ).toBe('none');
    expect(
      clampFormValuesToRestrictions({ responseType: 'whiteboard' }, VC_KNOWLEDGE_BASE_CALLOUT_RESTRICTIONS).responseType
    ).toBe('none');
  });

  test('VC preset: an allowed response type (post / link) is preserved', () => {
    expect(
      clampFormValuesToRestrictions({ responseType: 'post' }, VC_KNOWLEDGE_BASE_CALLOUT_RESTRICTIONS).responseType
    ).toBe('post');
    expect(
      clampFormValuesToRestrictions({ responseType: 'link' }, VC_KNOWLEDGE_BASE_CALLOUT_RESTRICTIONS).responseType
    ).toBe('link');
  });

  test('VC preset: template comment flags are forced off', () => {
    const result = clampFormValuesToRestrictions(
      { framingCommentsEnabled: true, contributionCommentsEnabled: true },
      VC_KNOWLEDGE_BASE_CALLOUT_RESTRICTIONS
    );
    expect(result.framingCommentsEnabled).toBe(false);
    expect(result.contributionCommentsEnabled).toBe(false);
  });

  test('only the configured dimensions are clamped (partial restriction leaves others intact)', () => {
    const result = clampFormValuesToRestrictions(
      { framingChip: 'whiteboard', responseType: 'memo', framingCommentsEnabled: true },
      { allowedResponseChips: ['post', 'link'] }
    );
    // framing + comments untouched; only the response type is clamped.
    expect(result.framingChip).toBe('whiteboard');
    expect(result.framingCommentsEnabled).toBe(true);
    expect(result.responseType).toBe('none');
  });
});

describe('restrictionsForPickedTemplate', () => {
  // What the create dialog offers a non-admin in the default collaboration flow.
  const NON_ADMIN_FRAMINGS = ['whiteboard', 'memo', 'document', 'cta', 'image', 'poll'] as const;

  test('a non-admin picking a Form template never gets the Form framing', () => {
    const clamped = clampFormValuesToRestrictions(
      { framingChip: 'form', responseType: 'none' },
      restrictionsForPickedTemplate(undefined, [...NON_ADMIN_FRAMINGS])
    );
    expect(clamped.framingChip).toBe('none');
  });

  test('a non-admin keeps a Poll template framing', () => {
    const clamped = clampFormValuesToRestrictions(
      { framingChip: 'poll' },
      restrictionsForPickedTemplate(undefined, [...NON_ADMIN_FRAMINGS])
    );
    expect(clamped.framingChip).toBe('poll');
  });

  test('an admin keeps the Form framing', () => {
    const clamped = clampFormValuesToRestrictions(
      { framingChip: 'form' },
      restrictionsForPickedTemplate(undefined, [...NON_ADMIN_FRAMINGS, 'contributors', 'spaces', 'form'])
    );
    expect(clamped.framingChip).toBe('form');
  });

  test('keeps the caller restrictions and only replaces the framing allow-list', () => {
    expect(restrictionsForPickedTemplate(VC_KNOWLEDGE_BASE_CALLOUT_RESTRICTIONS, [])).toEqual(
      VC_KNOWLEDGE_BASE_CALLOUT_RESTRICTIONS
    );
    expect(restrictionsForPickedTemplate({ disableRichMedia: true }, ['poll'])).toEqual({
      disableRichMedia: true,
      allowedFramingChips: ['poll'],
    });
  });

  test('without an allow-list (edit mode) the restrictions pass through unchanged', () => {
    expect(restrictionsForPickedTemplate(undefined, undefined)).toBeUndefined();
    expect(restrictionsForPickedTemplate(VC_KNOWLEDGE_BASE_CALLOUT_RESTRICTIONS, undefined)).toBe(
      VC_KNOWLEDGE_BASE_CALLOUT_RESTRICTIONS
    );
  });
});
