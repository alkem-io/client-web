import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoSignedCopiesDialogConnector } from './MemoSignedCopiesDialogConnector';

const mocks = vi.hoisted(() => ({
  download: vi.fn(),
  historyOptions: vi.fn(),
  lastDialogProps: undefined as
    | {
        mode: string;
        signatures: Array<{ id: string; verification?: string }>;
      }
    | undefined,
  historyResult: {
    data: {
      lookup: {
        memo: {
          signatures: [
            {
              id: 'attempt-1',
              document: { id: 'document-1', url: '/api/private/document-1', displayName: 'Decision.pdf' },
              actor: { profile: { displayName: 'Alice Example', url: '/user/alice' } },
              updatedDate: '2026-09-10T09:00:00.000Z',
            },
          ],
        },
      },
    },
    error: undefined,
    loading: false,
  } as Record<string, unknown>,
  notify: vi.fn(),
  prepareHook: vi.fn(),
  continueHook: vi.fn(),
  verify: vi.fn(),
  verifyOptions: vi.fn(),
  verificationResult: { data: undefined, error: undefined, loading: false, variables: undefined } as Record<
    string,
    unknown
  >,
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useMemoSignedCopiesQuery: (options: unknown) => {
    mocks.historyOptions(options);
    return mocks.historyResult;
  },
  usePrepareMemoSigningMutation: mocks.prepareHook,
  useContinueMemoSigningMutation: mocks.continueHook,
  useVerifyMemoSignatureLazyQuery: (options: unknown) => {
    mocks.verifyOptions(options);
    return [mocks.verify, mocks.verificationResult];
  },
}));

vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => mocks.notify,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

vi.mock('./downloadMemoSignaturePdf', () => ({
  downloadMemoSignaturePdf: mocks.download,
}));

vi.mock('@/crd/components/memo/MemoSigningDialog', () => ({
  MemoSigningDialog: (props: {
    open: boolean;
    mode: string;
    historyState: string;
    signatures: Array<{ id: string; document?: { id: string; url: string; displayName?: string } }>;
    onVerify: (attemptId: string) => void;
    onDownload: (document: { id: string; url: string; displayName?: string }) => void;
    onOpenChange: (open: boolean) => void;
  }) => {
    mocks.lastDialogProps = props;
    return props.open ? (
      <div data-testid="signed-copies-dialog" data-history-state={props.historyState}>
        <output data-testid="history-count">{props.signatures.length}</output>
        <button type="button" onClick={() => props.onVerify('attempt-1')}>
          verify
        </button>
        <button
          type="button"
          onClick={() =>
            props.onDownload({
              id: 'document-1',
              url: '/api/private/document-1',
              displayName: 'Decision.pdf',
            })
          }
        >
          download
        </button>
        <button type="button" onClick={() => props.onOpenChange(false)}>
          close
        </button>
      </div>
    ) : null;
  },
}));

function Harness({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

describe('MemoSignedCopiesDialogConnector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.download.mockResolvedValue(undefined);
    mocks.lastDialogProps = undefined;
    mocks.verificationResult = { data: undefined, error: undefined, loading: false, variables: undefined };
    mocks.historyResult = {
      data: {
        lookup: {
          memo: {
            signatures: [
              {
                id: 'attempt-1',
                document: { id: 'document-1', url: '/api/private/document-1', displayName: 'Decision.pdf' },
                actor: { profile: { displayName: 'Alice Example', url: '/user/alice' } },
                updatedDate: '2026-09-10T09:00:00.000Z',
              },
            ],
          },
        },
      },
      error: undefined,
      loading: false,
    };
  });

  it('skips history while closed and starts cache-and-network only when opened for the selected memo', () => {
    const { rerender } = render(
      <Harness>
        <MemoSignedCopiesDialogConnector open={false} memoId="memo-1" onOpenChange={vi.fn()} />
      </Harness>
    );

    expect(mocks.historyOptions).toHaveBeenLastCalledWith({
      variables: { memoID: 'memo-1' },
      skip: true,
      fetchPolicy: 'cache-and-network',
    });

    rerender(
      <Harness>
        <MemoSignedCopiesDialogConnector open={true} memoId="memo-2" onOpenChange={vi.fn()} />
      </Harness>
    );

    expect(mocks.historyOptions).toHaveBeenLastCalledWith({
      variables: { memoID: 'memo-2' },
      skip: false,
      fetchPolicy: 'cache-and-network',
    });
    expect(screen.getByTestId('signed-copies-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('history-count')).toHaveTextContent('1');
    expect(mocks.prepareHook).not.toHaveBeenCalled();
    expect(mocks.continueHook).not.toHaveBeenCalled();
  });

  it('keeps Verify explicit and uncached', async () => {
    const user = userEvent.setup();
    render(<MemoSignedCopiesDialogConnector open={true} memoId="memo-1" onOpenChange={vi.fn()} />);

    expect(mocks.verifyOptions).toHaveBeenCalledWith({ fetchPolicy: 'no-cache' });
    expect(mocks.verify).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'verify' }));

    expect(mocks.verify).toHaveBeenCalledWith({ variables: { attemptID: 'attempt-1' } });
  });

  it.each([
    { result: { loading: true }, expected: 'checking' },
    {
      result: { data: { verifyMemoSignature: 'VERIFIED' } },
      expected: 'verified',
    },
    {
      result: { data: { verifyMemoSignature: 'INVALID' } },
      expected: 'invalid',
    },
    {
      result: { data: { verifyMemoSignature: 'UNAVAILABLE' } },
      expected: 'unavailable',
    },
    {
      result: { error: new Error('gateway unavailable') },
      expected: 'unavailable',
    },
  ])('maps an explicitly requested verification result to $expected', ({ result, expected }) => {
    mocks.verificationResult = {
      data: undefined,
      error: undefined,
      loading: false,
      variables: { attemptID: 'attempt-1' },
      ...result,
    };

    render(<MemoSignedCopiesDialogConnector open={true} memoId="memo-1" onOpenChange={vi.fn()} />);

    expect(mocks.lastDialogProps?.mode).toBe('history');
    expect(mocks.lastDialogProps?.signatures[0].verification).toBe(expected);
  });

  it('downloads through the authenticated helper and localizes a visible failure notification', async () => {
    const user = userEvent.setup();
    mocks.download.mockRejectedValue(new Error('forbidden'));
    render(<MemoSignedCopiesDialogConnector open={true} memoId="memo-1" onOpenChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'download' }));

    expect(mocks.download).toHaveBeenCalledWith({
      id: 'document-1',
      url: '/api/private/document-1',
      displayName: 'Decision.pdf',
    });
    await waitFor(() => expect(mocks.notify).toHaveBeenCalledWith('memo.signing.downloadFailed', 'error'));
  });
});
