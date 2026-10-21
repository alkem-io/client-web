import { describe, expect, test } from 'vitest';
import { normalizePushTargetUrl } from './normalizePushTargetUrl';

const ORIGIN = 'https://sandbox-alkem.io';

describe('normalizePushTargetUrl', () => {
  describe('shapes FR-007 pins', () => {
    test('reduces an origin-rooted absolute url to its path', () => {
      expect(normalizePushTargetUrl(`${ORIGIN}/spaces/my-space`, ORIGIN)).toBe('/spaces/my-space');
    });

    test('keeps search and hash of an absolute url', () => {
      expect(normalizePushTargetUrl(`${ORIGIN}/spaces/my-space?tab=2#members`, ORIGIN)).toBe(
        '/spaces/my-space?tab=2#members'
      );
    });

    test("the bare home link '/' stays '/'", () => {
      expect(normalizePushTargetUrl('/', ORIGIN)).toBe('/');
    });

    test('a same-origin-relative path is returned as-is', () => {
      expect(normalizePushTargetUrl('/spaces/my-space?tab=2#members', ORIGIN)).toBe('/spaces/my-space?tab=2#members');
    });
  });

  describe('stays on the start route', () => {
    test('a different origin', () => {
      expect(normalizePushTargetUrl('https://evil.example/spaces/my-space', ORIGIN)).toBeUndefined();
    });

    test('a protocol-relative url', () => {
      expect(normalizePushTargetUrl('//evil.example/spaces/my-space', ORIGIN)).toBeUndefined();
    });

    test('a non-http(s) scheme', () => {
      expect(normalizePushTargetUrl('javascript:alert(1)', ORIGIN)).toBeUndefined();
      expect(normalizePushTargetUrl('data:text/html,<script>alert(1)</script>', ORIGIN)).toBeUndefined();
    });

    test('an unparseable url', () => {
      expect(normalizePushTargetUrl('http://', ORIGIN)).toBeUndefined();
    });

    test('an empty string', () => {
      expect(normalizePushTargetUrl('', ORIGIN)).toBeUndefined();
    });

    test('a missing or non-string value', () => {
      expect(normalizePushTargetUrl(undefined, ORIGIN)).toBeUndefined();
      expect(normalizePushTargetUrl(42, ORIGIN)).toBeUndefined();
      expect(normalizePushTargetUrl({ url: '/spaces/my-space' }, ORIGIN)).toBeUndefined();
    });
  });
});
