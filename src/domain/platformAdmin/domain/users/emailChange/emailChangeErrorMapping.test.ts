import { describe, expect, it } from 'vitest';
import { EMAIL_CHANGE_GENERIC_ERROR_KEY, mapEmailChangeErrorCode } from './emailChangeErrorMapping';

const DOCUMENTED_CODES = [
  'EMAIL_CHANGE_VALIDATION',
  'EMAIL_CHANGE_NO_CHANGE',
  'EMAIL_CHANGE_CONFLICT',
  'EMAIL_CHANGE_SUBJECT_NOT_FOUND',
  'EMAIL_CHANGE_KRATOS_UNREACHABLE',
  'EMAIL_CHANGE_KRATOS_WRITE_FAILED',
  'EMAIL_CHANGE_ALKEMIO_WRITE_FAILED',
  'EMAIL_CHANGE_DRIFT_DETECTED',
  'EMAIL_CHANGE_DRIFT_RESOLUTION_FAILED',
  'EMAIL_CHANGE_DRIFT_NOT_FOUND',
  'EMAIL_CHANGE_UNAUTHORIZED',
];

describe('mapEmailChangeErrorCode', () => {
  it('maps every documented error code to a defined, non-generic message key', () => {
    for (const code of DOCUMENTED_CODES) {
      const key = mapEmailChangeErrorCode(code);
      expect(key).toBeTruthy();
      expect(key).not.toBe(EMAIL_CHANGE_GENERIC_ERROR_KEY);
    }
  });

  it('maps each documented code to a distinct message key', () => {
    const keys = DOCUMENTED_CODES.map(code => mapEmailChangeErrorCode(code));
    expect(new Set(keys).size).toBe(DOCUMENTED_CODES.length);
  });

  it('falls back to the generic catch-all for an unmapped code', () => {
    expect(mapEmailChangeErrorCode('SOMETHING_UNEXPECTED')).toBe(EMAIL_CHANGE_GENERIC_ERROR_KEY);
  });

  it('falls back to the generic catch-all when there is no code', () => {
    expect(mapEmailChangeErrorCode(undefined)).toBe(EMAIL_CHANGE_GENERIC_ERROR_KEY);
    expect(mapEmailChangeErrorCode('')).toBe(EMAIL_CHANGE_GENERIC_ERROR_KEY);
  });

  it('maps EMAIL_CHANGE_CONFLICT to the dedicated generic "already in use" key with no holder detail', () => {
    expect(mapEmailChangeErrorCode('EMAIL_CHANGE_CONFLICT')).toBe('pages.admin.users.emailChange.errors.conflict');
  });
});
