/**
 * Unit tests for anonymizeGuestName utility
 * Task: T048 - Add unit tests for anonymization logic
 * Spec: 002-guest-whiteboard-access, Phase 8 - Derived Authenticated Guest Name
 */

import { describe, expect, it } from 'vitest';
import { anonymizeGuestName } from '../utils/anonymizeGuestName';
import { validateGuestName } from '../utils/guestNameValidator';

describe('anonymizeGuestName - Guest Name Derivation', () => {
  // The derived name is used as the guest identity (WS handshake, asset header, awareness
  // label), so it MUST pass the strict validator — previously the trailing "." was rejected,
  // silently killing the anonymous-identity path for every authenticated user with a surname.
  describe('derived name passes the guest-name validator', () => {
    it.each([
      ['Alice', 'Brown'],
      ['José', 'García'],
      ['李明', '王'],
      ['A', 'B'],
      [null, 'Brown'],
      ['Alice', null],
      // In-word apostrophes / periods are OUTSIDE the validator alphabet (/^[\p{L}\p{N} _-]+$/u).
      // The derived name must strip them so the guest identity still validates — otherwise the
      // authenticated-guest path silently collapses to the generic "Guest".
      ["O'Brien", 'Xavier'],
      ["O'Brien", null],
      ['Dr. Alice', 'Brown'],
      ['Dr.', 'Brown'],
      [null, "O'Connor"],
      // Over-length: the validator caps at 50 chars, so the derived name must be bounded.
      ['A'.repeat(100), 'Smith'],
      ['A'.repeat(100), null],
    ] as const)('anonymizeGuestName(%s, %s) → valid', (first, last) => {
      const name = anonymizeGuestName(first, last);
      expect(name).not.toBeNull();
      expect(validateGuestName(name as string).valid).toBe(true);
    });

    it('sanitizes a surname before selecting its initial', () => {
      expect(anonymizeGuestName(null, "O'Connor")).toBe('O');
    });
  });

  describe('Full name scenarios (firstName + lastName)', () => {
    it('should derive the period-free "FirstName L" format when both names are provided', () => {
      const result = anonymizeGuestName('Alice', 'Brown');
      expect(result).toBe('Alice B');
    });

    it('should handle multi-word first names by taking first word only', () => {
      const result = anonymizeGuestName('Alice Marie', 'Brown');
      expect(result).toBe('Alice B');
    });

    it('should handle multi-word last names by using first character', () => {
      const result = anonymizeGuestName('Alice', 'Van der Berg');
      expect(result).toBe('Alice V');
    });

    it('should uppercase last initial even if lowercase in input', () => {
      const result = anonymizeGuestName('Alice', 'brown');
      expect(result).toBe('Alice B');
    });

    it('should handle names with extra whitespace', () => {
      const result = anonymizeGuestName('  Alice  ', '  Brown  ');
      expect(result).toBe('Alice B');
    });

    it('should handle single-character first and last names', () => {
      const result = anonymizeGuestName('A', 'B');
      expect(result).toBe('A B');
    });
  });

  describe('Partial name scenarios', () => {
    describe('firstName only', () => {
      it('should return firstName when lastName is null', () => {
        const result = anonymizeGuestName('Alice', null);
        expect(result).toBe('Alice');
      });

      it('should return firstName when lastName is undefined', () => {
        const result = anonymizeGuestName('Alice', undefined);
        expect(result).toBe('Alice');
      });

      it('should return firstName when lastName is empty string', () => {
        const result = anonymizeGuestName('Alice', '');
        expect(result).toBe('Alice');
      });

      it('should return firstName when lastName is whitespace only', () => {
        const result = anonymizeGuestName('Alice', '   ');
        expect(result).toBe('Alice');
      });

      it('should handle multi-word firstName by taking first word', () => {
        const result = anonymizeGuestName('Alice Marie', null);
        expect(result).toBe('Alice');
      });

      it('should trim whitespace from firstName', () => {
        const result = anonymizeGuestName('  Alice  ', null);
        expect(result).toBe('Alice');
      });
    });

    describe('lastName only', () => {
      it('should return the period-free "L" form when firstName is null', () => {
        const result = anonymizeGuestName(null, 'Brown');
        expect(result).toBe('B');
      });

      it('should return the period-free "L" form when firstName is undefined', () => {
        const result = anonymizeGuestName(undefined, 'Brown');
        expect(result).toBe('B');
      });

      it('should return the period-free "L" form when firstName is empty string', () => {
        const result = anonymizeGuestName('', 'Brown');
        expect(result).toBe('B');
      });

      it('should return the period-free "L" form when firstName is whitespace only', () => {
        const result = anonymizeGuestName('   ', 'Brown');
        expect(result).toBe('B');
      });

      it('should uppercase the last initial', () => {
        const result = anonymizeGuestName(null, 'brown');
        expect(result).toBe('B');
      });

      it('should handle multi-word lastName by using first character', () => {
        const result = anonymizeGuestName(null, 'Van der Berg');
        expect(result).toBe('V');
      });

      it('should trim whitespace from lastName', () => {
        const result = anonymizeGuestName(null, '  Brown  ');
        expect(result).toBe('B');
      });
    });
  });

  describe('No derivation possible (fallback to prompt)', () => {
    it('should return null when both names are null', () => {
      const result = anonymizeGuestName(null, null);
      expect(result).toBeNull();
    });

    it('should return null when both names are undefined', () => {
      const result = anonymizeGuestName(undefined, undefined);
      expect(result).toBeNull();
    });

    it('should return null when both names are empty strings', () => {
      const result = anonymizeGuestName('', '');
      expect(result).toBeNull();
    });

    it('should return null when both names are whitespace only', () => {
      const result = anonymizeGuestName('   ', '   ');
      expect(result).toBeNull();
    });

    it('should return null when firstName is whitespace and lastName is empty', () => {
      const result = anonymizeGuestName('  ', '');
      expect(result).toBeNull();
    });

    it('should return null when firstName is empty and lastName is whitespace', () => {
      const result = anonymizeGuestName('', '  ');
      expect(result).toBeNull();
    });
  });

  describe('Edge cases and special characters', () => {
    it('should handle names with hyphens', () => {
      const result = anonymizeGuestName('Mary-Jane', 'Parker-Smith');
      expect(result).toBe('Mary-Jane P');
    });

    it('should strip in-word apostrophes so the derived name passes the validator', () => {
      // The apostrophe is outside the validator alphabet — it is stripped, the abbreviation
      // semantics (first word + last initial) are otherwise preserved.
      const result = anonymizeGuestName("O'Brien", "O'Connor");
      expect(result).toBe('OBrien O');
    });

    it('should handle names with accented characters', () => {
      const result = anonymizeGuestName('José', 'García');
      expect(result).toBe('José G');
    });

    it('should handle names with unicode characters', () => {
      const result = anonymizeGuestName('李明', '王');
      expect(result).toBe('李明 王');
    });

    it('should handle names with numbers', () => {
      const result = anonymizeGuestName('Alice2', 'Brown3');
      expect(result).toBe('Alice2 B');
    });

    it('should bound extremely long derived names to the validator length limit (50)', () => {
      const longName = 'A'.repeat(100);
      const result = anonymizeGuestName(longName, 'Smith');
      // Capped at 50 chars so it satisfies `validateGuestName`'s length bound.
      expect(result).toBe('A'.repeat(50));
      expect(validateGuestName(result as string).valid).toBe(true);
    });

    it('should handle single character names correctly', () => {
      const result = anonymizeGuestName('X', 'Y');
      expect(result).toBe('X Y');
    });
  });

  describe('Real-world examples', () => {
    it('should handle common Western names', () => {
      expect(anonymizeGuestName('John', 'Doe')).toBe('John D');
      expect(anonymizeGuestName('Jane', 'Smith')).toBe('Jane S');
      expect(anonymizeGuestName('Michael', 'Johnson')).toBe('Michael J');
    });

    it('should handle names with prefixes', () => {
      expect(anonymizeGuestName('Van', 'Helsing')).toBe('Van H');
      expect(anonymizeGuestName('De', 'Silva')).toBe('De S');
    });

    it('should handle compound names', () => {
      expect(anonymizeGuestName('Jean-Paul', 'Sartre')).toBe('Jean-Paul S');
      expect(anonymizeGuestName('Mary Anne', 'Thompson')).toBe('Mary T');
    });

    it('should handle professional titles as part of name (edge case)', () => {
      // The title WORD is kept (only the first whitespace-delimited token is taken); the period
      // is stripped because it is outside the validator alphabet, so "Dr." → "Dr".
      expect(anonymizeGuestName('Dr. Alice', 'Brown')).toBe('Dr B');
    });
  });
});
