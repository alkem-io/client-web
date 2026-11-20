import { act, renderHook } from '@testing-library/react';
import i18next from 'i18next';
import { createElement, type ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { beforeAll, describe, expect, test } from 'vitest';
import { createFormOption, createFormQuestion } from '@/crd/forms/callout/formValues';
import type { FormQuestionValue } from '@/crd/forms/callout/types';
import commonEnJson from '@/crd/i18n/common/common.en.json';
import spaceEnJson from '@/crd/i18n/space/space.en.json';
import { formQuestionErrors, useCrdCalloutForm } from './useCrdCalloutForm';

const i18n = i18next.createInstance();

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['crd-space', 'crd-common'],
    defaultNS: 'crd-space',
    resources: { en: { 'crd-space': spaceEnJson, 'crd-common': commonEnJson } },
    interpolation: { escapeValue: false },
  });
});

const wrapper = ({ children }: { children: ReactNode }) => createElement(I18nextProvider, { i18n }, children);

const shortText = (prompt = 'Your name'): FormQuestionValue => createFormQuestion({ prompt });
const choice = (labels: string[], prompt = 'Pick'): FormQuestionValue =>
  createFormQuestion({
    prompt,
    type: 'SINGLE_CHOICE',
    options: labels.map(label => createFormOption(label)),
  });

const validateForm = (
  questions: FormQuestionValue[],
  framingChip: 'form' | 'none' = 'form',
  header: { title?: string; description?: string } = {}
) => {
  const { result } = renderHook(() => useCrdCalloutForm(), { wrapper });
  act(() => {
    result.current.setField('title', 'A form');
    result.current.setField('framingChip', framingChip);
    result.current.setField('formQuestions', questions);
    if (header.title !== undefined) result.current.setField('formTitle', header.title);
    if (header.description !== undefined) result.current.setField('formDescription', header.description);
  });
  let errors: ReturnType<typeof result.current.validate> = {};
  act(() => {
    errors = result.current.validate();
  });
  return errors;
};

describe('useCrdCalloutForm — form framing validation', () => {
  test('a single valid short-text question passes', () => {
    expect(validateForm([shortText()])).toEqual({});
  });

  test('starts with one empty short-text question and the documented default settings', () => {
    const { result } = renderHook(() => useCrdCalloutForm(), { wrapper });
    expect(result.current.values.formQuestions).toHaveLength(1);
    expect(result.current.values.formQuestions[0]).toMatchObject({ type: 'SHORT_TEXT', prompt: '', required: false });
    expect(result.current.values.formSettings).toEqual({
      visibility: 'ADMINS',
      responseMode: 'SINGLE',
      state: 'OPEN',
      defaultCollapsed: false,
    });
    expect(result.current.values.formTitle).toBe('');
    expect(result.current.values.formDescription).toBe('');
  });

  test('zero questions is rejected with the count message', () => {
    const errors = validateForm([]);
    expect(errors.formQuestions).toBe('At least 1 question is required');
  });

  test('51 questions is rejected with the maximum message', () => {
    const errors = validateForm(Array.from({ length: 51 }, (_, i) => shortText(`Q${i}`)));
    expect(errors.formQuestions).toBe('At most 50 questions are allowed');
  });

  test('exactly 50 questions passes', () => {
    expect(validateForm(Array.from({ length: 50 }, (_, i) => shortText(`Q${i}`)))).toEqual({});
  });

  test('an empty prompt marks that question', () => {
    const errors = validateForm([shortText('ok'), shortText('   ')]);
    expect(errors['formQuestions.1.prompt']).toBe('The question text is required');
    expect(errors['formQuestions.0.prompt']).toBeUndefined();
  });

  test('a 513-character prompt is rejected and 512 passes', () => {
    expect(validateForm([shortText('a'.repeat(513))])['formQuestions.0.prompt']).toBe('The question text is too long');
    expect(validateForm([shortText('a'.repeat(512))])).toEqual({});
  });

  test('a 513-character form title is rejected and 512 passes', () => {
    expect(validateForm([shortText()], 'form', { title: 't'.repeat(513) }).formTitle).toBe(
      'The form title can be at most 512 characters'
    );
    expect(validateForm([shortText()], 'form', { title: 't'.repeat(512) })).toEqual({});
  });

  test('a 2049-character form description is rejected and 2048 passes', () => {
    expect(validateForm([shortText()], 'form', { description: 'd'.repeat(2049) }).formDescription).toBe(
      'The form description can be at most 2048 characters'
    );
    expect(validateForm([shortText()], 'form', { description: 'd'.repeat(2048) })).toEqual({});
  });

  test('an over-long explanation is rejected', () => {
    const errors = validateForm([createFormQuestion({ prompt: 'ok', explanation: 'x'.repeat(2049) })]);
    expect(errors['formQuestions.0.explanation']).toBe('The explanation is too long');
  });

  test('a choice question with one option is rejected', () => {
    expect(validateForm([choice(['only'])])['formQuestions.0.options']).toBe('At least 2 options are required');
  });

  test('a choice question with 21 options is rejected and 20 passes', () => {
    const labels = (n: number) => Array.from({ length: n }, (_, i) => `Option ${i}`);
    expect(validateForm([choice(labels(21))])['formQuestions.0.options']).toBe('At most 20 options are allowed');
    expect(validateForm([choice(labels(20))])).toEqual({});
  });

  test('duplicate option labels are rejected (after trimming)', () => {
    expect(validateForm([choice(['Same', ' Same '])])['formQuestions.0.options']).toBe(
      'Options must be different from each other'
    );
  });

  test('an empty option label marks that option', () => {
    const errors = validateForm([choice(['A', ''])]);
    expect(errors['formQuestions.0.options.1']).toBe('Option text is required');
  });

  test('a 513-character option label is rejected', () => {
    expect(validateForm([choice(['A', 'b'.repeat(513)])])['formQuestions.0.options.1']).toBe(
      'The option text is too long'
    );
  });

  test('text kinds ignore leftover options', () => {
    const question = createFormQuestion({ prompt: 'ok', type: 'LONG_TEXT', options: [createFormOption('')] });
    expect(validateForm([question])).toEqual({});
  });

  test('the form rules do not apply to other framing chips', () => {
    expect(validateForm([], 'none').formQuestions).toBeUndefined();
  });

  test('formQuestionErrors strips the namespace for the builder', () => {
    expect(
      formQuestionErrors({
        title: 'x',
        formTitle: 'ft',
        formDescription: 'fd',
        formQuestions: 'count',
        'formQuestions.0.prompt': 'p',
        'formQuestions.1.options.0': 'o',
      })
    ).toEqual({ title: 'ft', description: 'fd', questions: 'count', '0.prompt': 'p', '1.options.0': 'o' });
  });

  test('editing the question list clears stale per-question errors', () => {
    const { result } = renderHook(() => useCrdCalloutForm(), { wrapper });
    act(() => {
      result.current.setField('title', 'A form');
      result.current.setField('framingChip', 'form');
      result.current.setField('formQuestions', [shortText('')]);
    });
    act(() => {
      result.current.validate();
    });
    expect(result.current.errors['formQuestions.0.prompt']).toBeDefined();
    act(() => {
      result.current.setField('formQuestions', [shortText('now filled')]);
    });
    expect(result.current.errors['formQuestions.0.prompt']).toBeUndefined();
  });
});
