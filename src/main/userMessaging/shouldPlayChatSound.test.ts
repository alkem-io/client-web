import { describe, expect, it } from 'vitest';
import { shouldPlayChatSound } from './shouldPlayChatSound';

/**
 * Truth table over the four booleans. Covers spec US1 scenarios #1–#4 plus
 * own-message suppression (FR-001). This is the single highest-leverage test:
 * the subscription hook is large and untested, and every US1 acceptance
 * scenario reduces to these four inputs.
 */
describe('shouldPlayChatSound', () => {
  it('US1 #1 — not viewing, tab focused, someone else, enabled → plays', () => {
    expect(shouldPlayChatSound({ isOwnMessage: false, isViewing: false, hasFocus: true, enabled: true })).toBe(true);
  });

  it('US1 #2 — conversation selected AND tab focused → suppressed', () => {
    expect(shouldPlayChatSound({ isOwnMessage: false, isViewing: true, hasFocus: true, enabled: true })).toBe(false);
  });

  it('US1 #3 — a different conversation selected (not viewing this one), focused → plays', () => {
    expect(shouldPlayChatSound({ isOwnMessage: false, isViewing: false, hasFocus: true, enabled: true })).toBe(true);
  });

  it('US1 #4 — conversation selected but tab NOT focused → plays (focus required to suppress)', () => {
    expect(shouldPlayChatSound({ isOwnMessage: false, isViewing: true, hasFocus: false, enabled: true })).toBe(true);
  });

  it('FR-001(b) — own message never sounds, even when not viewing and focused', () => {
    expect(shouldPlayChatSound({ isOwnMessage: true, isViewing: false, hasFocus: true, enabled: true })).toBe(false);
  });

  it('own message stays suppressed regardless of the other inputs', () => {
    expect(shouldPlayChatSound({ isOwnMessage: true, isViewing: true, hasFocus: false, enabled: true })).toBe(false);
    expect(shouldPlayChatSound({ isOwnMessage: true, isViewing: false, hasFocus: false, enabled: true })).toBe(false);
  });

  it('FR-004 — disabled preference never sounds, whatever the selection/focus', () => {
    expect(shouldPlayChatSound({ isOwnMessage: false, isViewing: false, hasFocus: true, enabled: false })).toBe(false);
    expect(shouldPlayChatSound({ isOwnMessage: false, isViewing: true, hasFocus: false, enabled: false })).toBe(false);
  });

  it('not focused, not viewing, someone else, enabled → plays (backgrounded tab still alerts)', () => {
    expect(shouldPlayChatSound({ isOwnMessage: false, isViewing: false, hasFocus: false, enabled: true })).toBe(true);
  });
});
