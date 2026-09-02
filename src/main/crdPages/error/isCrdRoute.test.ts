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

    it('returns false for reserved top-level paths that still render MUI when CRD is on', () => {
      // Pages without a CRD branch in TopLevelRoutes.tsx — must stay MUI so the
      // error/redirect chrome matches the (MUI) page beneath.
      expect(isCrdRoute('/innovation-hubs')).toBe(false);
      expect(isCrdRoute('/contributors')).toBe(false);
      expect(isCrdRoute('/profile/me')).toBe(false);
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

  describe('reserved segments migrated to CRD (page is CRD when toggle is on)', () => {
    // Regression guard: these render CRD pages in TopLevelRoutes.tsx, so a private
    // resource here must show CRD error chrome — not drop back into MUI.
    it('returns true for /vc/:id (Virtual Contributor profile)', () => {
      expect(isCrdRoute('/vc/some-vc')).toBe(true);
    });

    it('returns true for the VC knowledge-base sub-path', () => {
      expect(isCrdRoute('/vc/some-vc/knowledge-base')).toBe(true);
    });

    it('returns true for /innovation-packs/:id (template packs)', () => {
      expect(isCrdRoute('/innovation-packs/my-pack')).toBe(true);
      expect(isCrdRoute('/innovation-packs/my-pack/some-template')).toBe(true);
    });

    it('returns true for /innovation-library', () => {
      expect(isCrdRoute('/innovation-library')).toBe(true);
    });

    it('returns true for /user/:id and /organization/:id', () => {
      expect(isCrdRoute('/user/me')).toBe(true);
      expect(isCrdRoute('/organization/foo')).toBe(true);
    });

    it('returns true for /admin, /docs, /forum, /hub', () => {
      expect(isCrdRoute('/admin')).toBe(true);
      expect(isCrdRoute('/admin/users')).toBe(true);
      expect(isCrdRoute('/docs')).toBe(true);
      expect(isCrdRoute('/forum')).toBe(true);
      expect(isCrdRoute('/hub/some-hub')).toBe(true);
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
