import { describe, expect, it } from 'vitest';
import { type ChangeUserEmailFormValues, changeUserEmailSchema } from './changeUserEmailSchema';

const CURRENT = 'current.user@example.com';

const validApprover = { name: 'Jane Doe', role: 'Organization Administrator', organization: 'Acme Inc' };

const isValid = (values: Partial<ChangeUserEmailFormValues> = {}, currentEmail = CURRENT): Promise<boolean> =>
  changeUserEmailSchema(currentEmail).isValid({
    newEmail: 'new.address@example.com',
    confirmEmail: 'new.address@example.com',
    reason: 'Support ticket #1234',
    approver: validApprover,
    ...values,
  });

describe('changeUserEmailSchema', () => {
  it('rejects a syntactically invalid new email', async () => {
    expect(await isValid({ newEmail: 'not-an-email', confirmEmail: 'not-an-email' })).toBe(false);
  });

  it('rejects an empty new email', async () => {
    expect(await isValid({ newEmail: '', confirmEmail: '' })).toBe(false);
  });

  it('rejects a new email identical to the current one', async () => {
    expect(await isValid({ newEmail: CURRENT, confirmEmail: CURRENT })).toBe(false);
  });

  it('rejects a new email identical to the current one ignoring case', async () => {
    expect(await isValid({ newEmail: 'Current.User@Example.com', confirmEmail: 'Current.User@Example.com' })).toBe(
      false
    );
  });

  it('rejects when the confirmation does not match the new email', async () => {
    expect(await isValid({ confirmEmail: 'different@example.com' })).toBe(false);
  });

  it('rejects an empty reason', async () => {
    expect(await isValid({ reason: '' })).toBe(false);
  });

  it('rejects a blank-only reason', async () => {
    expect(await isValid({ reason: '   ' })).toBe(false);
  });

  it('rejects an empty approver name', async () => {
    expect(await isValid({ approver: { ...validApprover, name: '' } })).toBe(false);
  });

  it('rejects an empty approver role', async () => {
    expect(await isValid({ approver: { ...validApprover, role: '' } })).toBe(false);
  });

  it('accepts an empty approver organization', async () => {
    expect(await isValid({ approver: { ...validApprover, organization: '' } })).toBe(true);
  });

  it('accepts a valid, different new email with reason and approver', async () => {
    expect(await isValid()).toBe(true);
  });
});
