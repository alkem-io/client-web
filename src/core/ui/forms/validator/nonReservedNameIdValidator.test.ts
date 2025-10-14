import { describe, expect, test } from 'vitest';
import nonReservedNameIdValidator from './nonReservedNameIdValidator';

describe('nonReservedNameIdValidator', () => {
  describe('basic functionality', () => {
    test('accepts valid non-reserved nameIds', async () => {
      await expect(nonReservedNameIdValidator.validate('my-space')).resolves.toBe('my-space');
      await expect(nonReservedNameIdValidator.validate('test123')).resolves.toBe('test123');
      await expect(nonReservedNameIdValidator.validate('custom-name')).resolves.toBe('custom-name');
    });
  });

  describe('reserved path validation', () => {
    test('rejects reserved top-level route paths', async () => {
      // Test some common reserved paths
      await expect(nonReservedNameIdValidator.validate('admin')).rejects.toThrow();
      await expect(nonReservedNameIdValidator.validate('user')).rejects.toThrow();
      await expect(nonReservedNameIdValidator.validate('organization')).rejects.toThrow();
      await expect(nonReservedNameIdValidator.validate('home')).rejects.toThrow();
      await expect(nonReservedNameIdValidator.validate('forum')).rejects.toThrow();
      await expect(nonReservedNameIdValidator.validate('profile')).rejects.toThrow();
      await expect(nonReservedNameIdValidator.validate('docs')).rejects.toThrow();
      await expect(nonReservedNameIdValidator.validate('help')).rejects.toThrow();
      await expect(nonReservedNameIdValidator.validate('about')).rejects.toThrow();
    });

    test('rejects innovation-related reserved paths', async () => {
      await expect(nonReservedNameIdValidator.validate('innovation-library')).rejects.toThrow();
      await expect(nonReservedNameIdValidator.validate('innovation-packs')).rejects.toThrow();
      await expect(nonReservedNameIdValidator.validate('innovation-hubs')).rejects.toThrow();
    });

    test('rejects legacy reserved paths', async () => {
      await expect(nonReservedNameIdValidator.validate('landing')).rejects.toThrow();
      await expect(nonReservedNameIdValidator.validate('identity')).rejects.toThrow();
    });

    test('rejects virtual contributor path', async () => {
      await expect(nonReservedNameIdValidator.validate('vc')).rejects.toThrow();
    });

    test('accepts similar but non-reserved paths', async () => {
      await expect(nonReservedNameIdValidator.validate('admins')).resolves.toBe('admins'); // plural
      await expect(nonReservedNameIdValidator.validate('my-admin')).resolves.toBe('my-admin'); // with prefix
      await expect(nonReservedNameIdValidator.validate('user123')).resolves.toBe('user123'); // with number
      await expect(nonReservedNameIdValidator.validate('help-center')).resolves.toBe('help-center'); // different name
    });
  });

  describe('inherits nameIdValidator rules', () => {
    test('still enforces format validation', async () => {
      await expect(nonReservedNameIdValidator.validate('MySpace')).rejects.toThrow(); // uppercase
      await expect(nonReservedNameIdValidator.validate('my_space')).rejects.toThrow(); // underscore
      await expect(nonReservedNameIdValidator.validate('my space')).rejects.toThrow(); // space
    });

    test('still enforces minLength (3)', async () => {
      await expect(nonReservedNameIdValidator.validate('ab')).rejects.toThrow();
      await expect(nonReservedNameIdValidator.validate('a')).rejects.toThrow();
    });

    test('still enforces maxLength (25)', async () => {
      const longNameId = 'a'.repeat(26);
      await expect(nonReservedNameIdValidator.validate(longNameId)).rejects.toThrow();
    });

    test('still requires a value', async () => {
      await expect(nonReservedNameIdValidator.validate('')).rejects.toThrow();
      await expect(nonReservedNameIdValidator.validate(undefined)).rejects.toThrow();
    });
  });

  describe('edge cases', () => {
    test('case-sensitive validation (reserved paths are lowercase)', async () => {
      // These should be rejected by format rules (uppercase), not by reserved path check
      await expect(nonReservedNameIdValidator.validate('Admin')).rejects.toThrow();
      await expect(nonReservedNameIdValidator.validate('USER')).rejects.toThrow();
    });

    test('accepts paths that contain reserved words but are not exact matches', async () => {
      await expect(nonReservedNameIdValidator.validate('admin-panel')).resolves.toBe('admin-panel');
      await expect(nonReservedNameIdValidator.validate('user-guide')).resolves.toBe('user-guide');
      await expect(nonReservedNameIdValidator.validate('my-forum')).resolves.toBe('my-forum');
    });

    test('handles paths starting with reserved words', async () => {
      await expect(nonReservedNameIdValidator.validate('home-page')).resolves.toBe('home-page');
      await expect(nonReservedNameIdValidator.validate('docs-site')).resolves.toBe('docs-site');
    });

    test('handles paths ending with reserved words', async () => {
      await expect(nonReservedNameIdValidator.validate('my-home')).resolves.toBe('my-home');
      await expect(nonReservedNameIdValidator.validate('the-forum')).resolves.toBe('the-forum');
    });
  });

  describe('validation errors', () => {
    test('provides appropriate error for reserved paths', async () => {
      try {
        await nonReservedNameIdValidator.validate('admin');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
        // Should reference the reserved route error message
      }
    });

    test('provides appropriate error for format violations', async () => {
      try {
        await nonReservedNameIdValidator.validate('Invalid_Name');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
