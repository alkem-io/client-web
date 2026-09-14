import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMemoSigningFlow } from '@/main/crdPages/memo/useMemoSigningFlow';
import { MemoContributionAddConnector } from './MemoContributionAddConnector';

const state = vi.hoisted(() => ({
  createMemo: vi.fn(),
  memoDialogProps: undefined as Record<string, unknown> | undefined,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCreateMemoOnCalloutMutation: () => [state.createMemo],
}));
vi.mock('@/main/crdPages/memo/CrdMemoDialog', () => ({
  CrdMemoDialog: (props: Record<string, unknown>) => {
    state.memoDialogProps = props;
    return <div data-testid="created-memo-editor" />;
  },
}));

beforeEach(() => {
  state.memoDialogProps = undefined;
  state.createMemo.mockReset();
  state.createMemo.mockResolvedValue({
    data: {
      createContributionOnCallout: {
        id: 'contribution-1',
        memo: { id: 'memo-1' },
      },
    },
  });
});

describe('MemoContributionAddConnector signing origin', () => {
  it('carries the created contribution origin through continuation, one allowlisted store, and navigation', async () => {
    const user = userEvent.setup();
    render(<MemoContributionAddConnector calloutId="callout-1" open={true} onOpenChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'dialogs.create' }));

    expect(await screen.findByTestId('created-memo-editor')).toBeInTheDocument();
    await waitFor(() =>
      expect(state.memoDialogProps).toEqual(
        expect.objectContaining({
          memoId: 'memo-1',
          signingOrigin: {
            kind: 'contribution',
            calloutId: 'callout-1',
            contributionId: 'contribution-1',
          },
        })
      )
    );

    const continuationOrder: string[] = [];
    let resolveContinuation!: (url: string) => void;
    const continueSigning = vi.fn(
      () =>
        new Promise<string>(resolve => {
          resolveContinuation = url => {
            continuationOrder.push('continue-resolved');
            resolve(url);
          };
        })
    );
    const navigate = vi.fn(() => continuationOrder.push('navigate'));
    const storagePrototype = Object.getPrototypeOf(window.sessionStorage) as Storage;
    const originalSetItem = storagePrototype.setItem;
    const setItem = vi.spyOn(storagePrototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      continuationOrder.push('store');
      return originalSetItem.call(this, key, value);
    });
    const origin = state.memoDialogProps?.signingOrigin as {
      kind: 'contribution';
      calloutId: string;
      contributionId: string;
    };
    const { result } = renderHook(() =>
      useMemoSigningFlow({
        memoId: state.memoDialogProps?.memoId as string,
        requestDurability: vi.fn(),
        prepare: () => Promise.resolve({ attemptId: 'attempt-1', previewUrl: '/snapshot/attempt-1' }),
        continueSigning,
        navigate,
        returnContext: { userId: 'user-1', memoId: state.memoDialogProps?.memoId as string, ...origin },
      })
    );

    await act(() => result.current.prepare());
    let continuation!: Promise<void>;
    act(() => {
      continuation = result.current.continueSigning();
    });
    expect(setItem).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();

    await act(async () => {
      resolveContinuation('https://cleverbase.example/authorize');
      await continuation;
    });

    expect(setItem).toHaveBeenCalledOnce();
    expect(JSON.parse(setItem.mock.calls[0]?.[1] ?? '{}')).toEqual({
      version: 1,
      expiresAt: expect.any(Number),
      attemptId: 'attempt-1',
      userId: 'user-1',
      memoId: 'memo-1',
      kind: 'contribution',
      calloutId: 'callout-1',
      contributionId: 'contribution-1',
    });
    expect(continuationOrder).toEqual(['continue-resolved', 'store', 'navigate']);
    setItem.mockRestore();
  });
});
