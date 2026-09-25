import { describe, expect, test } from 'vitest';
import type { ValidationError } from 'yup';
import { LONG_MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { postContributionFormSchema } from '../postContributionFormSchema';

const validateDescription = (description: string) => {
  try {
    postContributionFormSchema.validateSyncAt('description', { description });
    return undefined;
  } catch (error) {
    return (error as ValidationError).errors[0];
  }
};

describe('postContributionFormSchema description length', () => {
  test('accepts a description of exactly the maximum length', () => {
    expect(validateDescription('a'.repeat(LONG_MARKDOWN_TEXT_LENGTH))).toBeUndefined();
  });

  test('rejects a description one character over the maximum length', () => {
    expect(validateDescription('a'.repeat(LONG_MARKDOWN_TEXT_LENGTH + 1))).toBeDefined();
  });

  // Long-form content such as a pasted newsletter used to be rejected at the
  // previous 16000 ceiling even though the API accepts far more.
  test('accepts a 20000 character long-form description', () => {
    expect(validateDescription('a'.repeat(20000))).toBeUndefined();
  });

  test('still rejects an empty description', () => {
    expect(validateDescription('')).toBeDefined();
  });
});
