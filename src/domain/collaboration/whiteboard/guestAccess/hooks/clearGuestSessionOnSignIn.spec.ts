/**
 * Unit tests for clearGuestSessionOnSignIn helper
 * Tests that guest session data is properly cleared when user signs in
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { clearGuestSessionOnSignIn } from './useGuestSession';

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

describe('clearGuestSessionOnSignIn', () => {
  beforeEach(() => {
    sessionStorageMock.clear();
  });

  it('should remove guest name from session storage', () => {
    // Arrange
    sessionStorageMock.setItem('alkemio_guest_name', 'TestGuest');
    expect(sessionStorageMock.getItem('alkemio_guest_name')).toBe('TestGuest');

    // Act
    clearGuestSessionOnSignIn();

    // Assert
    expect(sessionStorageMock.getItem('alkemio_guest_name')).toBeNull();
  });

  it('should handle when guest name does not exist', () => {
    // Arrange - no guest name set
    expect(sessionStorageMock.getItem('alkemio_guest_name')).toBeNull();

    // Act - should not throw
    expect(() => clearGuestSessionOnSignIn()).not.toThrow();

    // Assert - still null
    expect(sessionStorageMock.getItem('alkemio_guest_name')).toBeNull();
  });

  it('should only remove guest name and preserve other session data', () => {
    // Arrange
    sessionStorageMock.setItem('alkemio_guest_name', 'TestGuest');
    sessionStorageMock.setItem('other_data', 'preserved');
    sessionStorageMock.setItem('returnUrl', '/some/path');

    // Act
    clearGuestSessionOnSignIn();

    // Assert
    expect(sessionStorageMock.getItem('alkemio_guest_name')).toBeNull();
    expect(sessionStorageMock.getItem('other_data')).toBe('preserved');
    expect(sessionStorageMock.getItem('returnUrl')).toBe('/some/path');
  });
});
