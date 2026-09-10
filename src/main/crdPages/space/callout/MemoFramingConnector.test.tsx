import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { MemoFramingConnector } from './MemoFramingConnector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, variables?: { count?: number }) =>
      key === 'memo.signing.signedCopiesCount' ? `Signed copies (${variables?.count})` : key,
  }),
}));

vi.mock('@/domain/collaboration/memo/MemoManager/useMemoManager', () => ({
  default: () => ({
    memo: {
      id: 'memo-1',
      markdown: 'Decision',
      signatures: [
        { id: 'signed-1', document: { id: 'document-1' } },
        { id: 'incomplete-1', document: null },
      ],
    },
  }),
}));

describe('MemoFramingConnector signed copies', () => {
  it('opens framing history for the right memo without opening the memo editor', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onOpenSignedCopies = vi.fn();
    const callout = {
      id: 'callout-1',
      framing: {
        type: CalloutFramingType.Memo,
        profile: { displayName: 'Decision' },
        memo: { id: 'memo-1', markdown: 'Decision' },
      },
    };

    render(
      <MemoFramingConnector
        callout={callout as never}
        onOpen={onOpen}
        {...({ onOpenSignedCopies } as Record<string, unknown>)}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Signed copies (1)' }));

    expect(onOpenSignedCopies).toHaveBeenCalledWith('memo-1');
    expect(onOpen).not.toHaveBeenCalled();
  });
});
