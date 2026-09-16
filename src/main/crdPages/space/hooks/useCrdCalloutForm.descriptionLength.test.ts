import { act, renderHook } from '@testing-library/react';
import i18next from 'i18next';
import { createElement, type ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { beforeAll, describe, expect, test } from 'vitest';
import { LONG_MARKDOWN_TEXT_LENGTH, MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import commonEnJson from '@/crd/i18n/common/common.en.json';
import spaceEnJson from '@/crd/i18n/space/space.en.json';
import { useCrdCalloutForm } from './useCrdCalloutForm';

// Real resources rather than a key-echoing stub: what this suite pins is the
// wording the author actually reads, so the translation has to be resolved.
const i18n = i18next.createInstance();

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['crd-space', 'crd-common'],
    defaultNS: 'crd-space',
    resources: { en: { 'crd-space': spaceEnJson, 'crd-common': commonEnJson } },
    // Mirrors the app's i18n config (src/core/i18n/config.ts).
    interpolation: { escapeValue: false },
  });
});

const wrapper = ({ children }: { children: ReactNode }) => createElement(I18nextProvider, { i18n }, children);

const validateDescription = (description: string) => {
  const { result } = renderHook(() => useCrdCalloutForm(), { wrapper });
  act(() => {
    result.current.setField('description', description);
  });
  let errors: ReturnType<typeof result.current.validate> = {};
  act(() => {
    errors = result.current.validate();
  });
  return { errors, rendered: result.current.errors };
};

const tooLong = () => validateDescription('a'.repeat(LONG_MARKDOWN_TEXT_LENGTH + 1));

describe('useCrdCalloutForm — callout framing description length', () => {
  test('accepts a description of exactly the maximum length', () => {
    expect(validateDescription('a'.repeat(LONG_MARKDOWN_TEXT_LENGTH)).errors.description).toBeUndefined();
  });

  test('rejects a description one character over the maximum length', () => {
    expect(tooLong().errors.description).toBeDefined();
  });

  // A pasted long-form body used to be rejected at the old 8000 ceiling even
  // though the API accepts far more on the very same profile description field.
  test('accepts a 20000 character long-form description', () => {
    expect('a'.repeat(20000).length).toBeGreaterThan(MARKDOWN_TEXT_LENGTH);
    expect(validateDescription('a'.repeat(20000)).errors.description).toBeUndefined();
  });

  // The limit counts raw markdown, so a figure in the message would not match the
  // text the author sees — and there is no live counter to reconcile it against.
  test('the rejection message names no character figure', () => {
    expect(tooLong().errors.description).not.toMatch(/\d/);
  });

  test('the rejection message is the shared count-free length message', () => {
    expect(tooLong().errors.description).toBe(commonEnJson.components['wysiwyg-editor'].validation.maxLength);
  });

  // Widening the hook to two namespaces must not move any other message: the
  // first namespace stays the default, so bare keys still resolve to `crd-space`.
  test('bare keys still resolve against crd-space', () => {
    const { result } = renderHook(() => useCrdCalloutForm(), { wrapper });
    let errors: ReturnType<typeof result.current.validate> = {};
    act(() => {
      errors = result.current.validate();
    });
    expect(errors.title).toBe(spaceEnJson.validation.required);
    expect(errors.title).not.toContain('validation.');
  });

  // The silent-save defect: validate() aborted submit but the error was never
  // surfaced. It must at minimum reach the hook's own error state.
  test('publishes the description error into the hook error state', () => {
    expect(tooLong().rendered.description).toBeDefined();
  });
});
