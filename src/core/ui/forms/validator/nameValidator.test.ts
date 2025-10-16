import { describe, expect, test } from 'vitest';
import { nameValidator } from './nameValidator';

describe('nameValidator', () => {
  describe('basic functionality', () => {
    test('accepts valid names', async () => {
      await expect(nameValidator.validate('John')).resolves.toBe('John');
      await expect(nameValidator.validate('Alice Smith')).resolves.toBe('Alice Smith');
      await expect(nameValidator.validate('Bob-123')).resolves.toBe('Bob-123');
    });
  });

  describe('minLength validation (1 character)', () => {
    test('accepts names with 1 character', async () => {
      await expect(nameValidator.validate('A')).resolves.toBe('A');
      await expect(nameValidator.validate('X')).resolves.toBe('X');
    });

    test('accepts names with more than 1 character', async () => {
      await expect(nameValidator.validate('John')).resolves.toBe('John');
      await expect(nameValidator.validate('Alice')).resolves.toBe('Alice');
    });

    test('rejects empty string', async () => {
      await expect(nameValidator.validate('')).rejects.toThrow();
    });
  });

  describe('maxLength validation (SMALL_TEXT_LENGTH)', () => {
    test('rejects names longer than SMALL_TEXT_LENGTH (128)', async () => {
      const longName = 'A'.repeat(129);
      await expect(nameValidator.validate(longName)).rejects.toThrow();
    });

    test('accepts names equal to SMALL_TEXT_LENGTH (128)', async () => {
      const maxLengthName = 'A'.repeat(128);
      await expect(nameValidator.validate(maxLengthName)).resolves.toBe(maxLengthName);
    });

    test('accepts names shorter than SMALL_TEXT_LENGTH', async () => {
      const shortName = 'A'.repeat(50);
      await expect(nameValidator.validate(shortName)).resolves.toBe(shortName);
    });
  });

  describe('allowOnlySpaces validation (false)', () => {
    test('rejects names with only spaces', async () => {
      await expect(nameValidator.validate('   ')).rejects.toThrow();
      await expect(nameValidator.validate(' ')).rejects.toThrow();
    });

    test('accepts names with text and spaces', async () => {
      await expect(nameValidator.validate('John Doe')).resolves.toBe('John Doe');
      await expect(nameValidator.validate(' Alice ')).resolves.toBe(' Alice ');
    });
  });

  describe('edge cases', () => {
    test('handles single character names', async () => {
      await expect(nameValidator.validate('I')).resolves.toBe('I');
      await expect(nameValidator.validate('O')).resolves.toBe('O');
    });

    test('handles names with special characters', async () => {
      await expect(nameValidator.validate("O'Connor")).resolves.toBe("O'Connor");
      await expect(nameValidator.validate('Marie-Claire')).resolves.toBe('Marie-Claire');
      await expect(nameValidator.validate('José')).resolves.toBe('José');
    });

    test('handles names with numbers', async () => {
      await expect(nameValidator.validate('User1')).resolves.toBe('User1');
      await expect(nameValidator.validate('123')).resolves.toBe('123');
    });

    test('handles unicode names', async () => {
      await expect(nameValidator.validate('李明')).resolves.toBe('李明');
      await expect(nameValidator.validate('Дмитрий')).resolves.toBe('Дмитрий');
    });
  });
});
