import { describe, expect, it, vi } from 'vitest';
import { ReadOnlyCode } from '@/core/ui/forms/CollaborativeMarkdownInput/stateless-messaging/read.only.code';
import { mapMemoFooterProps } from '@/main/crdPages/memo/memoFooterMapper';

const base = {
  connectionStatus: 'connected' as const,
  phase: 'readOnly' as const,
  isAuthenticated: true,
  memberCount: 1,
  connectedUsers: [],
  isContribution: false,
  hasDeletePrivileges: false,
};

describe('mapMemoFooterProps inactivity recovery', () => {
  it('offers resume only for the explicit server inactivity downgrade', () => {
    const onResumeEditing = vi.fn();

    const inactive = mapMemoFooterProps({
      ...base,
      readOnlyCode: ReadOnlyCode.INACTIVITY,
      onResumeEditing,
    });
    expect(inactive.readonlyReason).toBe('inactivity');
    expect(inactive.onResumeEditing).toBe(onResumeEditing);

    const forbidden = mapMemoFooterProps({
      ...base,
      readOnlyCode: ReadOnlyCode.NO_UPDATE_ACCESS,
      onResumeEditing,
    });
    expect(forbidden.readonlyReason).not.toBe('inactivity');
    expect(forbidden.onResumeEditing).toBeUndefined();
  });

  it('does not turn a disconnected transport into a manual resume action', () => {
    const result = mapMemoFooterProps({
      ...base,
      connectionStatus: 'disconnected',
      phase: 'recovering',
      readOnlyCode: ReadOnlyCode.INACTIVITY,
      onResumeEditing: vi.fn(),
    });

    expect(result.readonlyReason).toBeNull();
    expect(result.onResumeEditing).toBeUndefined();
  });

  it('distinguishes a terminal end from reconnecting and only resumes a manual size-limit end', () => {
    const onResumeEditing = vi.fn();
    const terminal = mapMemoFooterProps({
      ...base,
      connectionStatus: 'disconnected',
      phase: 'terminal',
      sessionEndCode: 'document-deleted',
      onResumeEditing,
    });
    expect(terminal.readonlyReason).toBe('sessionEnded');
    expect(terminal.onResumeEditing).toBeUndefined();

    const manual = mapMemoFooterProps({
      ...base,
      connectionStatus: 'disconnected',
      phase: 'replaceGeneration',
      sessionEndCode: 'document-size-limit-exceeded',
      onResumeEditing,
    });
    expect(manual.readonlyReason).toBe('sizeLimitExceeded');
    expect(manual.onResumeEditing).toBe(onResumeEditing);
  });
});
