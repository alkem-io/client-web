import { describe, expect, it } from 'vitest';

import { isCrdRoute } from './isCrdRoute';

describe('isCrdRoute', () => {
  describe('non-CRD inputs', () => {
    it('returns false for empty string', () => {
      expect(isCrdRoute('')).toBe(false);
    });

    it('returns false for "/"', () => {
      expect(isCrdRoute('/')).toBe(false);
    });

    it('returns false for reserved top-level paths', () => {
      expect(isCrdRoute('/admin')).toBe(false);
      expect(isCrdRoute('/admin/users')).toBe(false);
      expect(isCrdRoute('/innovation-library')).toBe(false);
      expect(isCrdRoute('/innovation-packs')).toBe(false);
      expect(isCrdRoute('/innovation-hubs')).toBe(false);
      expect(isCrdRoute('/user/me')).toBe(false);
      expect(isCrdRoute('/organization/foo')).toBe(false);
      expect(isCrdRoute('/forum')).toBe(false);
      expect(isCrdRoute('/profile/me')).toBe(false);
      expect(isCrdRoute('/contributors')).toBe(false);
      expect(isCrdRoute('/docs')).toBe(false);
      expect(isCrdRoute('/contact')).toBe(false);
      expect(isCrdRoute('/help')).toBe(false);
      expect(isCrdRoute('/landing')).toBe(false);
      expect(isCrdRoute('/identity')).toBe(false);
    });
  });

  describe('CRD top-level routes', () => {
    it('returns true for /home', () => {
      expect(isCrdRoute('/home')).toBe(true);
    });

    it('returns true for /home/ (trailing slash)', () => {
      expect(isCrdRoute('/home/')).toBe(true);
    });

    it('returns true for /spaces', () => {
      expect(isCrdRoute('/spaces')).toBe(true);
    });

    it('returns true for /spaces?foo=bar (with query string)', () => {
      expect(isCrdRoute('/spaces?foo=bar')).toBe(true);
    });

    it('returns true for /restricted', () => {
      expect(isCrdRoute('/restricted')).toBe(true);
    });

    it('returns true for /restricted?origin=/somewhere', () => {
      expect(isCrdRoute('/restricted?origin=/somewhere')).toBe(true);
    });
  });

  describe('public whiteboard routes', () => {
    it('returns true for /public/whiteboard/<id>', () => {
      expect(isCrdRoute('/public/whiteboard/abc123')).toBe(true);
    });

    it('returns true for /public/whiteboard/<id> with query', () => {
      expect(isCrdRoute('/public/whiteboard/abc123?token=xyz')).toBe(true);
    });
  });

  describe('Space tree (non-reserved first segment)', () => {
    it('returns true for a top-level Space URL', () => {
      expect(isCrdRoute('/welcome-space')).toBe(true);
    });

    it('returns true for a nested Subspace URL', () => {
      expect(isCrdRoute('/welcome-space/challenges/foo')).toBe(true);
    });

    it('returns true for Space URL with query string', () => {
      expect(isCrdRoute('/welcome-space?tab=overview')).toBe(true);
    });

    it('returns true for Space URL with hash', () => {
      expect(isCrdRoute('/welcome-space#section')).toBe(true);
    });
  });
});
