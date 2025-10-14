import { describe, expect, test } from 'vitest';
import { urlValidator } from './urlValidator';

describe('urlValidator', () => {
  describe('basic functionality', () => {
    test('accepts valid URLs', async () => {
      const validator = urlValidator();

      await expect(validator.validate('https://example.com')).resolves.toBe('https://example.com');
      await expect(validator.validate('http://test.org')).resolves.toBe('http://test.org');
      await expect(validator.validate('https://subdomain.example.com')).resolves.toBe('https://subdomain.example.com');
    });

    test('accepts empty string when not required', async () => {
      const validator = urlValidator();
      await expect(validator.validate('')).resolves.toBe('');
    });

    test('accepts undefined when not required', async () => {
      const validator = urlValidator();
      await expect(validator.validate(undefined)).resolves.toBeUndefined();
    });
  });

  describe('URL format validation', () => {
    test('rejects invalid URL formats', async () => {
      const validator = urlValidator();

      await expect(validator.validate('notaurl')).rejects.toThrow();
      await expect(validator.validate('missing-protocol.com')).rejects.toThrow();
      await expect(validator.validate('http://')).rejects.toThrow();
      await expect(validator.validate('://noprotocol.com')).rejects.toThrow();
      await expect(validator.validate('ht!tp://invalid.com')).rejects.toThrow(); // Invalid protocol
    });

    test('accepts URLs with different protocols', async () => {
      const validator = urlValidator();

      await expect(validator.validate('https://secure.com')).resolves.toBe('https://secure.com');
      await expect(validator.validate('http://insecure.com')).resolves.toBe('http://insecure.com');
      await expect(validator.validate('ftp://files.example.com')).resolves.toBe('ftp://files.example.com');
    });

    test('accepts URLs with paths and query parameters', async () => {
      const validator = urlValidator();

      await expect(validator.validate('https://example.com/path/to/page')).resolves.toBe(
        'https://example.com/path/to/page'
      );
      await expect(validator.validate('https://example.com?query=value')).resolves.toBe(
        'https://example.com?query=value'
      );
      await expect(validator.validate('https://example.com/path?q=1&p=2')).resolves.toBe(
        'https://example.com/path?q=1&p=2'
      );
    });

    test('accepts URLs with fragments', async () => {
      const validator = urlValidator();
      await expect(validator.validate('https://example.com#section')).resolves.toBe('https://example.com#section');
    });

    test('accepts URLs with ports', async () => {
      const validator = urlValidator();
      await expect(validator.validate('http://localhost:3000')).resolves.toBe('http://localhost:3000');
      await expect(validator.validate('https://example.com:8080')).resolves.toBe('https://example.com:8080');
    });
  });

  describe('required validation', () => {
    test('rejects empty string when required', async () => {
      const validator = urlValidator({ required: true });
      await expect(validator.validate('')).rejects.toThrow();
    });

    test('rejects undefined when required', async () => {
      const validator = urlValidator({ required: true });
      await expect(validator.validate(undefined)).rejects.toThrow();
    });

    test('accepts valid URL when required', async () => {
      const validator = urlValidator({ required: true });
      await expect(validator.validate('https://example.com')).resolves.toBe('https://example.com');
    });
  });

  describe('maxLength validation', () => {
    test('rejects URL longer than maxLength', async () => {
      const validator = urlValidator({ maxLength: 30 });
      await expect(validator.validate('https://verylongdomainname.com/with/long/path')).rejects.toThrow();
    });

    test('accepts URL equal to or shorter than maxLength', async () => {
      const validator = urlValidator({ maxLength: 50 });
      await expect(validator.validate('https://example.com')).resolves.toBe('https://example.com');
    });

    test('uses MID_TEXT_LENGTH as default maxLength', async () => {
      const validator = urlValidator();
      const longUrl = 'https://example.com/' + 'a'.repeat(500); // > 512 chars (MID_TEXT_LENGTH)
      await expect(validator.validate(longUrl)).rejects.toThrow();
    });
  });

  describe('combined validations', () => {
    test('validates both format and length', async () => {
      const validator = urlValidator({ maxLength: 30, required: true });

      await expect(validator.validate('')).rejects.toThrow(); // required
      await expect(validator.validate('notaurl')).rejects.toThrow(); // bad format
      await expect(validator.validate('https://toolongdomainname.com/path')).rejects.toThrow(); // too long
      await expect(validator.validate('https://short.com')).resolves.toBe('https://short.com'); // valid
    });
  });

  describe('default options', () => {
    test('works with no options', async () => {
      const validator = urlValidator();
      await expect(validator.validate('https://example.com')).resolves.toBe('https://example.com');
    });

    test('works with empty options object', async () => {
      const validator = urlValidator({});
      await expect(validator.validate('https://example.com')).resolves.toBe('https://example.com');
    });
  });

  describe('edge cases', () => {
    test('handles URLs with international domain names', async () => {
      const validator = urlValidator();
      await expect(validator.validate('https://münchen.de')).resolves.toBe('https://münchen.de');
    });

    test('handles URLs with IP addresses', async () => {
      const validator = urlValidator();
      await expect(validator.validate('http://192.168.1.1')).resolves.toBe('http://192.168.1.1');
      await expect(validator.validate('https://127.0.0.1:8080')).resolves.toBe('https://127.0.0.1:8080');
    });

    test('handles localhost URLs', async () => {
      const validator = urlValidator();
      await expect(validator.validate('http://localhost')).resolves.toBe('http://localhost');
      await expect(validator.validate('http://localhost:3000/path')).resolves.toBe('http://localhost:3000/path');
    });

    test('handles URLs with authentication', async () => {
      const validator = urlValidator();
      await expect(validator.validate('https://user:pass@example.com')).resolves.toBe('https://user:pass@example.com');
    });

    test('handles URLs with encoded characters', async () => {
      const validator = urlValidator();
      await expect(validator.validate('https://example.com/path%20with%20spaces')).resolves.toBe(
        'https://example.com/path%20with%20spaces'
      );
    });
  });
});
