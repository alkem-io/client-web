import { describe, expect, it } from 'vitest';
import { CalloutFormErrorCode } from '@/domain/collaboration/callout-form/utils/calloutFormErrors';
import { translateFormSubmitError } from './translateFormSubmitError';

const t = ((key: string) => key) as never;

describe('translateFormSubmitError', () => {
  it('maps the submit reason codes to localized keys', () => {
    expect(translateFormSubmitError(CalloutFormErrorCode.FORM_VISIBILITY_CHANGED, t)).toBe(
      'formFillIn.visibilityChanged'
    );
    for (const code of [
      'FORM_RESPONSE_ALREADY_EXISTS',
      'FORM_CLOSED',
      'CALLOUT_NOT_PUBLISHED',
      'FORM_ANSWER_REQUIRED',
      'FORM_ANSWER_TOO_LONG',
      'FORM_ANSWER_UNKNOWN_QUESTION',
      'FORM_ANSWER_DUPLICATE_QUESTION',
      'FORM_ANSWER_TYPE_MISMATCH',
      'FORM_ANSWER_INVALID_OPTION',
      'FORM_ANSWER_SELECTION_COUNT',
    ] as const) {
      expect(translateFormSubmitError(code, t)).toBe(`formFillIn.errors.${code}`);
    }
  });

  it('falls back to the generic message without a known code', () => {
    expect(translateFormSubmitError(undefined, t)).toBe('formFillIn.errors.generic');
    expect(translateFormSubmitError(CalloutFormErrorCode.FORM_UNKNOWN_OPTION_ID, t)).toBe('formFillIn.errors.generic');
  });
});
