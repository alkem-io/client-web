import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearMessagingDrafts,
  MESSAGING_DRAFTS_STORAGE_KEY,
  readMessagingDrafts,
  writeMessagingDrafts,
} from './messagingDrafts';

describe('messagingDrafts', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('readMessagingDrafts', () => {
    it('returns an empty map when nothing is stored', () => {
      expect(readMessagingDrafts()).toEqual({});
    });

    it('reads drafts namespaced per user', () => {
      localStorage.setItem(
        MESSAGING_DRAFTS_STORAGE_KEY,
        JSON.stringify({ 'user-1': { 'conv-1': 'hello' }, 'user-2': { 'conv-1': 'other' } })
      );

      expect(readMessagingDrafts()).toEqual({ 'user-1': { 'conv-1': 'hello' }, 'user-2': { 'conv-1': 'other' } });
    });

    it('drops whitespace-only drafts so they never render as an empty preview', () => {
      localStorage.setItem(
        MESSAGING_DRAFTS_STORAGE_KEY,
        JSON.stringify({ 'user-1': { 'conv-1': '   ', 'conv-2': 'real' } })
      );

      expect(readMessagingDrafts()).toEqual({ 'user-1': { 'conv-2': 'real' } });
    });

    it('omits a user left with no drafts at all', () => {
      localStorage.setItem(MESSAGING_DRAFTS_STORAGE_KEY, JSON.stringify({ 'user-1': { 'conv-1': '' } }));

      expect(readMessagingDrafts()).toEqual({});
    });

    it('treats malformed storage as no drafts rather than throwing', () => {
      localStorage.setItem(MESSAGING_DRAFTS_STORAGE_KEY, 'not json');
      expect(readMessagingDrafts()).toEqual({});

      localStorage.setItem(MESSAGING_DRAFTS_STORAGE_KEY, JSON.stringify(['nope']));
      expect(readMessagingDrafts()).toEqual({});

      localStorage.setItem(MESSAGING_DRAFTS_STORAGE_KEY, JSON.stringify({ 'user-1': 'nope' }));
      expect(readMessagingDrafts()).toEqual({});

      localStorage.setItem(MESSAGING_DRAFTS_STORAGE_KEY, JSON.stringify({ 'user-1': { 'conv-1': 42 } }));
      expect(readMessagingDrafts()).toEqual({});
    });
  });

  describe('writeMessagingDrafts', () => {
    it('round-trips through storage', () => {
      writeMessagingDrafts({ 'user-1': { 'conv-1': 'hello' } });

      expect(readMessagingDrafts()).toEqual({ 'user-1': { 'conv-1': 'hello' } });
    });

    it('removes the entry entirely once no user has a draft left', () => {
      writeMessagingDrafts({ 'user-1': { 'conv-1': 'hello' } });
      writeMessagingDrafts({});

      expect(localStorage.getItem(MESSAGING_DRAFTS_STORAGE_KEY)).toBeNull();
    });

    it('propagates a storage failure so the caller can report it', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('exceeded', 'QuotaExceededError');
      });

      expect(() => writeMessagingDrafts({ 'user-1': { 'conv-1': 'hello' } })).toThrow();
    });
  });

  describe('clearMessagingDrafts', () => {
    it('drops every user’s drafts', () => {
      writeMessagingDrafts({ 'user-1': { 'conv-1': 'hello' }, 'user-2': { 'conv-2': 'bye' } });

      clearMessagingDrafts();

      expect(localStorage.getItem(MESSAGING_DRAFTS_STORAGE_KEY)).toBeNull();
    });

    it('never throws when storage is unavailable', () => {
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('storage disabled');
      });

      expect(() => clearMessagingDrafts()).not.toThrow();
    });
  });
});
