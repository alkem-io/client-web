/**
 * Unit tests for anonymizeGuestName utility
 * Task: T048 - Add unit tests for anonymization logic
 * Spec: 002-guest-whiteboard-access, Phase 8 - Derived Authenticated Guest Name
 */

import { describe, it, expect } from 'vitest';
import { anonymizeGuestName } from '../utils/anonymizeGuestName';

describe('anonymizeGuestName - Guest Name Derivation', () => {
  describe('Full name scenarios (firstName + lastName)', () => {
    it('should derive "FirstName L." format when both names provided', () => {
      const result = anonymizeGuestName('Alice', 'Brown');
      expect(result).toBe('Alice B.');
    });

    it('should handle multi-word first names by taking first word only', () => {
      const result = anonymizeGuestName('Alice Marie', 'Brown');
      expect(result).toBe('Alice B.');
    });

    it('should handle multi-word last names by using first character', () => {
      const result = anonymizeGuestName('Alice', 'Van der Berg');
      expect(result).toBe('Alice V.');
    });

    it('should uppercase last initial even if lowercase in input', () => {
      const result = anonymizeGuestName('Alice', 'brown');
      expect(result).toBe('Alice B.');
    });

    it('should handle names with extra whitespace', () => {
      const result = anonymizeGuestName('  Alice  ', '  Brown  ');
      expect(result).toBe('Alice B.');
    });

    it('should handle single-character first and last names', () => {
      const result = anonymizeGuestName('A', 'B');
      expect(result).toBe('A B.');
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
      it('should return "L." when firstName is null', () => {
        const result = anonymizeGuestName(null, 'Brown');
        expect(result).toBe('B.');
      });

      it('should return "L." when firstName is undefined', () => {
        const result = anonymizeGuestName(undefined, 'Brown');
        expect(result).toBe('B.');
      });

      it('should return "L." when firstName is empty string', () => {
        const result = anonymizeGuestName('', 'Brown');
        expect(result).toBe('B.');
      });

      it('should return "L." when firstName is whitespace only', () => {
        const result = anonymizeGuestName('   ', 'Brown');
        expect(result).toBe('B.');
      });

      it('should uppercase the last initial', () => {
        const result = anonymizeGuestName(null, 'brown');
        expect(result).toBe('B.');
      });

      it('should handle multi-word lastName by using first character', () => {
        const result = anonymizeGuestName(null, 'Van der Berg');
        expect(result).toBe('V.');
      });

      it('should trim whitespace from lastName', () => {
        const result = anonymizeGuestName(null, '  Brown  ');
        expect(result).toBe('B.');
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
      expect(result).toBe('Mary-Jane P.');
    });

    it('should handle names with apostrophes', () => {
      const result = anonymizeGuestName("O'Brien", "O'Connor");
      expect(result).toBe("O'Brien O.");
    });

    it('should handle names with accented characters', () => {
      const result = anonymizeGuestName('José', 'García');
      expect(result).toBe('José G.');
    });

    it('should handle names with unicode characters', () => {
      const result = anonymizeGuestName('李明', '王');
      expect(result).toBe('李明 王.');
    });

    it('should handle names with numbers', () => {
      const result = anonymizeGuestName('Alice2', 'Brown3');
      expect(result).toBe('Alice2 B.');
    });

    it('should handle extremely long first names', () => {
      const longName = 'A'.repeat(100);
      const result = anonymizeGuestName(longName, 'Smith');
      expect(result).toBe(`${longName} S.`);
    });

    it('should handle single character names correctly', () => {
      const result = anonymizeGuestName('X', 'Y');
      expect(result).toBe('X Y.');
    });
  });

  describe('Real-world examples', () => {
    it('should handle common Western names', () => {
      expect(anonymizeGuestName('John', 'Doe')).toBe('John D.');
      expect(anonymizeGuestName('Jane', 'Smith')).toBe('Jane S.');
      expect(anonymizeGuestName('Michael', 'Johnson')).toBe('Michael J.');
    });

    it('should handle names with prefixes', () => {
      expect(anonymizeGuestName('Van', 'Helsing')).toBe('Van H.');
      expect(anonymizeGuestName('De', 'Silva')).toBe('De S.');
    });

    it('should handle compound names', () => {
      expect(anonymizeGuestName('Jean-Paul', 'Sartre')).toBe('Jean-Paul S.');
      expect(anonymizeGuestName('Mary Anne', 'Thompson')).toBe('Mary T.');
    });

    it('should handle professional titles as part of name (edge case)', () => {
      // Note: We don't strip titles - caller should sanitize input
      expect(anonymizeGuestName('Dr. Alice', 'Brown')).toBe('Dr. B.');
    });
  });
});
