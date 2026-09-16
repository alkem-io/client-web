import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { LONG_MARKDOWN_TEXT_LENGTH, MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { useCrdCalloutForm } from './useCrdCalloutForm';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params && 'count' in params ? `${key}:${params.count}` : key,
  }),
}));

const validateDescription = (description: string) => {
  const { result } = renderHook(() => useCrdCalloutForm());
  act(() => {
    result.current.setField('description', description);
  });
  let errors: ReturnType<typeof result.current.validate> = {};
  act(() => {
    errors = result.current.validate();
  });
  return { errors, rendered: result.current.errors };
};

describe('useCrdCalloutForm — callout framing description length', () => {
  test('accepts a description of exactly the maximum length', () => {
    expect(validateDescription('a'.repeat(LONG_MARKDOWN_TEXT_LENGTH)).errors.description).toBeUndefined();
  });

  test('rejects a description one character over the maximum length', () => {
    expect(validateDescription('a'.repeat(LONG_MARKDOWN_TEXT_LENGTH + 1)).errors.description).toBeDefined();
  });

  // A pasted long-form body used to be rejected at the old 8000 ceiling even
  // though the API accepts far more on the very same profile description field.
  test('accepts a 20000 character long-form description', () => {
    expect('a'.repeat(20000).length).toBeGreaterThan(MARKDOWN_TEXT_LENGTH);
    expect(validateDescription('a'.repeat(20000)).errors.description).toBeUndefined();
  });

  test('the rejection message quotes the limit that is actually enforced', () => {
    const { errors } = validateDescription('a'.repeat(LONG_MARKDOWN_TEXT_LENGTH + 1));
    expect(errors.description).toBe(`validation.maxMarkdown:${LONG_MARKDOWN_TEXT_LENGTH}`);
  });

  // The silent-save defect: validate() aborted submit but the error was never
  // surfaced. It must at minimum reach the hook's own error state.
  test('publishes the description error into the hook error state', () => {
    const { rendered } = validateDescription('a'.repeat(LONG_MARKDOWN_TEXT_LENGTH + 1));
    expect(rendered.description).toBeDefined();
  });
});
