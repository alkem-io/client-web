import { describe, expect, test } from 'vitest';
import { subdomainValidator } from './subdomainValidator';

describe('subdomainValidator', () => {
  describe('basic functionality', () => {
    test('accepts valid subdomains', async () => {
      await expect(subdomainValidator.validate('my-space')).resolves.toBe('my-space');
      await expect(subdomainValidator.validate('test123')).resolves.toBe('test123');
      await expect(subdomainValidator.validate('subdomain')).resolves.toBe('subdomain');
    });

    test('rejects empty string', async () => {
      await expect(subdomainValidator.validate('')).rejects.toThrow();
    });

    test('rejects undefined', async () => {
      await expect(subdomainValidator.validate(undefined)).rejects.toThrow();
    });
  });

  describe('format validation (same as nameIdValidator)', () => {
    test('accepts lowercase letters and numbers', async () => {
      await expect(subdomainValidator.validate('abc123')).resolves.toBe('abc123');
      await expect(subdomainValidator.validate('subdomain')).resolves.toBe('subdomain');
    });

    test('accepts hyphens', async () => {
      await expect(subdomainValidator.validate('my-subdomain')).resolves.toBe('my-subdomain');
      await expect(subdomainValidator.validate('test-123')).resolves.toBe('test-123');
    });

    test('rejects uppercase letters', async () => {
      await expect(subdomainValidator.validate('MySubdomain')).rejects.toThrow();
      await expect(subdomainValidator.validate('TEST')).rejects.toThrow();
    });

    test('rejects spaces', async () => {
      await expect(subdomainValidator.validate('my subdomain')).rejects.toThrow();
    });

    test('rejects special characters', async () => {
      await expect(subdomainValidator.validate('sub_domain')).rejects.toThrow();
      await expect(subdomainValidator.validate('sub.domain')).rejects.toThrow();
      await expect(subdomainValidator.validate('sub@domain')).rejects.toThrow();
    });
  });

  describe('length validation', () => {
    test('rejects subdomains shorter than 3 characters', async () => {
      await expect(subdomainValidator.validate('ab')).rejects.toThrow();
      await expect(subdomainValidator.validate('a')).rejects.toThrow();
    });

    test('accepts subdomains with exactly 3 characters', async () => {
      await expect(subdomainValidator.validate('abc')).resolves.toBe('abc');
      await expect(subdomainValidator.validate('123')).resolves.toBe('123');
    });

    test('rejects subdomains longer than 25 characters', async () => {
      const longSubdomain = 'a'.repeat(26);
      await expect(subdomainValidator.validate(longSubdomain)).rejects.toThrow();
    });

    test('accepts subdomains equal to 25 characters', async () => {
      const maxLengthSubdomain = 'a'.repeat(25);
      await expect(subdomainValidator.validate(maxLengthSubdomain)).resolves.toBe(maxLengthSubdomain);
    });
  });

  describe('edge cases', () => {
    test('handles numeric subdomains', async () => {
      await expect(subdomainValidator.validate('12345')).resolves.toBe('12345');
    });

    test('handles subdomains with multiple hyphens', async () => {
      await expect(subdomainValidator.validate('my-test-subdomain')).resolves.toBe('my-test-subdomain');
    });

    test('handles subdomains starting with number', async () => {
      await expect(subdomainValidator.validate('123-subdomain')).resolves.toBe('123-subdomain');
    });

    test('handles subdomains starting with hyphen', async () => {
      await expect(subdomainValidator.validate('-subdomain')).resolves.toBe('-subdomain');
    });

    test('handles subdomains ending with hyphen', async () => {
      await expect(subdomainValidator.validate('subdomain-')).resolves.toBe('subdomain-');
    });
  });

  describe('validation consistency with nameIdValidator', () => {
    test('uses same validation rules as nameIdValidator', async () => {
      // Valid for both
      await expect(subdomainValidator.validate('test-123')).resolves.toBe('test-123');

      // Invalid for both - uppercase
      await expect(subdomainValidator.validate('Test')).rejects.toThrow();

      // Invalid for both - too short
      await expect(subdomainValidator.validate('ab')).rejects.toThrow();

      // Invalid for both - special chars
      await expect(subdomainValidator.validate('test_123')).rejects.toThrow();
    });
  });
});
