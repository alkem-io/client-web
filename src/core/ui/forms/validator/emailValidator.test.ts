import { describe, expect, test } from 'vitest';
import { emailValidator } from './emailValidator';

describe('emailValidator', () => {
  describe('basic functionality', () => {
    test('accepts valid email addresses', async () => {
      const validator = emailValidator();
      await expect(validator.validate('user@example.com')).resolves.toBe('user@example.com');
      await expect(validator.validate('test.user@domain.co.uk')).resolves.toBe('test.user@domain.co.uk');
      await expect(validator.validate('name+tag@company.org')).resolves.toBe('name+tag@company.org');
    });

    test('accepts empty string when not required', async () => {
      const validator = emailValidator();
      await expect(validator.validate('')).resolves.toBe('');
    });

    test('accepts undefined when not required', async () => {
      const validator = emailValidator();
      await expect(validator.validate(undefined)).resolves.toBeUndefined();
    });
  });

  describe('email format validation', () => {
    test('rejects invalid email formats', async () => {
      const validator = emailValidator();

      await expect(validator.validate('notanemail')).rejects.toThrow();
      await expect(validator.validate('missing@domain')).rejects.toThrow();
      await expect(validator.validate('@nodomain.com')).rejects.toThrow();
      await expect(validator.validate('no-at-sign.com')).rejects.toThrow();
      await expect(validator.validate('spaces in@email.com')).rejects.toThrow();
      await expect(validator.validate('double@@domain.com')).rejects.toThrow();
    });

    test('accepts edge case valid emails', async () => {
      const validator = emailValidator();

      await expect(validator.validate('a@b.c')).resolves.toBe('a@b.c'); // minimal valid email
      await expect(validator.validate('user123@test-domain.com')).resolves.toBe('user123@test-domain.com');
    });
  });

  describe('required validation', () => {
    test('rejects empty string when required', async () => {
      const validator = emailValidator({ required: true });
      await expect(validator.validate('')).rejects.toThrow();
    });

    test('rejects undefined when required', async () => {
      const validator = emailValidator({ required: true });
      await expect(validator.validate(undefined)).rejects.toThrow();
    });

    test('accepts valid email when required', async () => {
      const validator = emailValidator({ required: true });
      await expect(validator.validate('test@example.com')).resolves.toBe('test@example.com');
    });
  });

  describe('maxLength validation', () => {
    test('rejects email longer than maxLength', async () => {
      const validator = emailValidator({ maxLength: 20 });
      await expect(validator.validate('verylongemailaddress@domain.com')).rejects.toThrow();
    });

    test('accepts email equal to maxLength', async () => {
      const validator = emailValidator({ maxLength: 20 });
      await expect(validator.validate('user@example.com')).resolves.toBe('user@example.com'); // exactly 16 chars
    });

    test('accepts email shorter than maxLength', async () => {
      const validator = emailValidator({ maxLength: 50 });
      await expect(validator.validate('a@b.c')).resolves.toBe('a@b.c');
    });

    test('uses SMALL_TEXT_LENGTH as default maxLength', async () => {
      const validator = emailValidator();
      const longEmail = 'a'.repeat(120) + '@example.com'; // > 128 chars (SMALL_TEXT_LENGTH)
      await expect(validator.validate(longEmail)).rejects.toThrow();
    });
  });

  describe('combined validations', () => {
    test('validates both format and length', async () => {
      const validator = emailValidator({ maxLength: 25, required: true });

      await expect(validator.validate('')).rejects.toThrow(); // required
      await expect(validator.validate('invalid')).rejects.toThrow(); // bad format
      await expect(validator.validate('toolongemailaddress@domain.com')).rejects.toThrow(); // too long
      await expect(validator.validate('valid@email.com')).resolves.toBe('valid@email.com'); // valid
    });
  });

  describe('default options', () => {
    test('works with no options', async () => {
      const validator = emailValidator();
      await expect(validator.validate('test@example.com')).resolves.toBe('test@example.com');
    });

    test('works with empty options object', async () => {
      const validator = emailValidator({});
      await expect(validator.validate('test@example.com')).resolves.toBe('test@example.com');
    });
  });

  describe('edge cases', () => {
    test('handles emails with subdomains', async () => {
      const validator = emailValidator();
      await expect(validator.validate('user@mail.company.co.uk')).resolves.toBe('user@mail.company.co.uk');
    });

    test('handles emails with special characters', async () => {
      const validator = emailValidator();
      await expect(validator.validate('user.name+tag@example.com')).resolves.toBe('user.name+tag@example.com');
    });

    test('handles emails with numbers', async () => {
      const validator = emailValidator();
      await expect(validator.validate('user123@domain456.com')).resolves.toBe('user123@domain456.com');
    });

    test('handles emails with hyphens in domain', async () => {
      const validator = emailValidator();
      await expect(validator.validate('user@test-domain.com')).resolves.toBe('user@test-domain.com');
    });
  });
});
