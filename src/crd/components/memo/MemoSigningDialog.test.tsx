import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import spaceEn from '@/crd/i18n/space/space.en.json';
import { MemoSigningDialog, type MemoSigningDialogProps } from './MemoSigningDialog';

const i18n = createInstance();

beforeAll(async () => {
  await i18n.init({
    lng: 'en',
    resources: { en: { 'crd-space': spaceEn } },
    interpolation: { escapeValue: false },
  });
});

const dialogProps = (props: Record<string, unknown> = {}) =>
  ({
    open: true,
    mode: 'signing',
    stage: 'preparing',
    signatures: [],
    onOpenChange: vi.fn(),
    onContinue: vi.fn(),
    onVerify: vi.fn(),
    onClose: vi.fn(),
    ...props,
  }) as MemoSigningDialogProps;

const renderDialog = (props: Record<string, unknown> = {}) =>
  render(
    <I18nextProvider i18n={i18n}>
      <MemoSigningDialog {...dialogProps(props)} />
    </I18nextProvider>
  );

describe('MemoSigningDialog', () => {
  it('announces preparation before a preview has resolved', () => {
    renderDialog();

    expect(screen.getByRole('status', { name: 'Preparing the exact memo copy for signing' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue to Cleverbase' })).not.toBeInTheDocument();
  });

  it('shows the exact PDF inline with a mobile fallback and disables duplicate continuation', async () => {
    const onContinue = vi.fn();
    const { rerender } = renderDialog({
      stage: 'preview',
      previewUrl: '/api/public/rest/content-signing/attempt-1/snapshot',
      onContinue,
    });

    expect(screen.getByTitle('Memo signing preview')).toHaveAttribute(
      'src',
      '/api/public/rest/content-signing/attempt-1/snapshot'
    );
    expect(screen.getByRole('link', { name: 'Open PDF preview' })).toHaveAttribute(
      'href',
      '/api/public/rest/content-signing/attempt-1/snapshot'
    );

    await userEvent.click(screen.getByRole('button', { name: 'Continue to Cleverbase' }));
    expect(onContinue).toHaveBeenCalledTimes(1);

    rerender(
      <I18nextProvider i18n={i18n}>
        <MemoSigningDialog
          open={true}
          stage="continuing"
          previewUrl="/api/public/rest/content-signing/attempt-1/snapshot"
          signatures={[]}
          onOpenChange={vi.fn()}
          onContinue={onContinue}
          onVerify={vi.fn()}
          onClose={vi.fn()}
        />
      </I18nextProvider>
    );
    expect(screen.getByRole('button', { name: 'Continuing to Cleverbase' })).toBeDisabled();
  });

  it('does not offer a gateway retry after continuation failed', () => {
    renderDialog({
      stage: 'continue-error',
      previewUrl: '/api/public/rest/content-signing/attempt-1/snapshot',
    });

    expect(screen.queryByRole('button', { name: 'Continue to Cleverbase' })).not.toBeInTheDocument();
  });

  it('closes from the dialog boundary and ignores signatures without a signed document', async () => {
    const onOpenChange = vi.fn();
    renderDialog({
      mode: 'history',
      stage: 'idle',
      historyState: 'ready',
      onOpenChange,
      signatures: [{ id: 'pending-1', updatedDate: '2026-09-05T10:30:00.000Z', recordedAt: '' }],
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Signed copies' })).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it.each([
    ['loading', 'Loading signed copies'],
    ['error', 'Signed copies could not be loaded'],
    ['ready', 'No signed copies have been saved yet'],
  ] as const)('shows an explicit %s history state without any signing action', (historyState, message) => {
    renderDialog({ mode: 'history', stage: 'idle', historyState, signatures: [] });

    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue to Cleverbase' })).not.toBeInTheDocument();
  });

  it('binds saved success actions to the returned attempt rather than a newer history row', () => {
    renderDialog({
      mode: 'signing',
      stage: 'signed',
      completedSignature: {
        id: 'returned-attempt',
        document: { id: 'returned-document', url: '/api/private/returned.pdf', displayName: 'returned.pdf' },
        updatedDate: '2026-09-10T09:00:00.000Z',
      },
      signatures: [
        {
          id: 'newer-unrelated-attempt',
          document: { url: '/api/private/newer.pdf' },
          updatedDate: '2026-09-10T10:00:00.000Z',
        },
      ],
    });

    expect(screen.getByRole('heading', { name: 'Signed copy saved' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open PDF' })).toHaveAttribute('href', '/api/private/returned.pdf');
    expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to memo' })).toBeInTheDocument();
    expect(
      screen.getByText('This signed copy is a fixed snapshot. Later memo edits do not change it.')
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /newer\.pdf/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue to Cleverbase' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Review the exact PDF copy before starting/)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Signed copies' })).not.toBeInTheDocument();
  });

  it('delegates an authenticated download instead of relying on the anchor download attribute', async () => {
    const onDownload = vi.fn();
    renderDialog({
      mode: 'history',
      stage: 'idle',
      historyState: 'ready',
      signatures: [
        {
          id: 'attempt-1',
          document: { id: 'document-1', url: '/api/private/file-1', displayName: 'signed-copy.pdf' },
          updatedDate: '2026-09-05T10:30:00.000Z',
          recordedAt: '09/05/2026, 10:30:00',
        },
      ],
      onDownload,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Download' }));
    expect(onDownload).toHaveBeenCalledWith({
      id: 'document-1',
      url: '/api/private/file-1',
      displayName: 'signed-copy.pdf',
    });
  });

  it('disables the exact document download while its authenticated fetch is in progress', async () => {
    const onDownload = vi.fn();
    renderDialog({
      mode: 'history',
      historyState: 'ready',
      signatures: [
        {
          id: 'attempt-1',
          document: { id: 'document-1', url: '/api/private/file-1', displayName: 'signed-copy.pdf' },
          updatedDate: '2026-09-05T10:30:00.000Z',
          recordedAt: '09/05/2026, 10:30:00',
        },
        {
          id: 'attempt-2',
          document: { id: 'document-2', url: '/api/private/file-2', displayName: 'another-copy.pdf' },
          updatedDate: '2026-09-05T11:30:00.000Z',
          recordedAt: '09/05/2026, 11:30:00',
        },
      ],
      downloadingDocumentId: 'document-1',
      onDownload,
    });

    const [busyDownload, availableDownload] = screen.getAllByRole('button', { name: 'Download' });
    expect(busyDownload).toBeDisabled();
    expect(busyDownload).toHaveAttribute('aria-busy', 'true');
    expect(availableDownload).toBeEnabled();
    expect(availableDownload).toHaveAttribute('aria-busy', 'false');
    await userEvent.click(busyDownload);
    expect(onDownload).not.toHaveBeenCalled();
    await userEvent.click(availableDownload);
    expect(onDownload).toHaveBeenCalledWith({
      id: 'document-2',
      url: '/api/private/file-2',
      displayName: 'another-copy.pdf',
    });
  });

  it.each([
    ['checking', 'Checking the signing result'],
    ['pending', 'Signing is still in progress. Reload this page to check again.'],
    ['cancelled', 'Signing was cancelled'],
    ['failed', 'The PDF could not be signed'],
    ['expired', 'This signing attempt expired'],
    ['prepare-error', 'The exact memo copy could not be prepared'],
    ['continue-error', 'The signing session could not be started. Prepare a fresh copy and try again.'],
    ['return-error', 'The signing result could not be loaded'],
  ] as const)('renders the %s server outcome', (stage, message) => {
    renderDialog({ stage });

    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it.each([
    ['checking', 'Checking the signing result'],
    ['pending', 'Signing is still in progress. Reload this page to check again.'],
    ['cancelled', 'Signing was cancelled'],
    ['failed', 'The PDF could not be signed'],
    ['expired', 'This signing attempt expired'],
    ['prepare-error', 'The exact memo copy could not be prepared'],
    ['continue-error', 'The signing session could not be started. Prepare a fresh copy and try again.'],
    ['return-error', 'The signing result could not be loaded'],
  ] as const)('keeps %s mutually exclusive from saved-copy and stale preview actions', (stage, message) => {
    renderDialog({
      mode: 'signing',
      stage,
      previewUrl: '/api/public/rest/content-signing/attempt-1/snapshot',
    });

    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Signed copy saved' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Open PDF' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Download' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue to Cleverbase' })).not.toBeInTheDocument();
    expect(screen.queryByTitle('Memo signing preview')).not.toBeInTheDocument();
  });

  it('lists independent signed copies with Alkemio attribution and a deleted-user fallback', () => {
    renderDialog({
      mode: 'history',
      stage: 'idle',
      historyState: 'ready',
      signatures: [
        {
          id: 'attempt-1',
          document: { id: 'document-1', url: '/api/private/file-1', displayName: 'Signed decision 1.pdf' },
          actor: { profile: { displayName: 'Alice Example', url: '/user/alice' } },
          updatedDate: '2026-09-05T10:30:00.000Z',
          recordedAt: '09/05/2026, 10:30:00',
        },
        {
          id: 'attempt-2',
          document: { id: 'document-2', url: '/api/private/file-2', displayName: 'Signed decision 2.pdf' },
          actor: { profile: { displayName: 'Former member', url: '' } },
          updatedDate: '2026-09-05T11:30:00.000Z',
          recordedAt: '09/05/2026, 11:30:00',
        },
      ],
    });

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Alice Example' })).toHaveAttribute('href', '/user/alice');
    expect(screen.getByText('Former member')).toBeInTheDocument();
    expect(screen.getAllByText(/Recorded:/)).toHaveLength(2);
    expect(screen.getByText('09/05/2026, 10:30:00')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Open PDF' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Download' })).toHaveLength(2);
    expect(
      screen.getByText('Downloaded PDFs can be independently verified with standard PDF tools.')
    ).toBeInTheDocument();
    expect(screen.getByText(/Each signed PDF is a separate copy; the memo remains editable/)).toBeInTheDocument();
    expect(screen.queryByText(/certificate|serial|common name/i)).not.toBeInTheDocument();
  });

  it('verifies a signed copy only on request and renders the three safe outcomes', async () => {
    const onVerify = vi.fn();
    const signature = {
      id: 'attempt-1',
      document: { id: 'document-1', url: '/api/private/file-1', displayName: 'Signed decision.pdf' },
      actor: { profile: { displayName: 'Alice Example', url: '/user/alice' } },
      updatedDate: '2026-09-05T10:30:00.000Z',
      recordedAt: '09/05/2026, 10:30:00',
    };
    const { rerender } = renderDialog({
      mode: 'history',
      stage: 'idle',
      historyState: 'ready',
      signatures: [signature],
      onVerify,
    });

    expect(onVerify).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Verify signature' }));
    expect(onVerify).toHaveBeenCalledOnce();
    expect(onVerify).toHaveBeenCalledWith('attempt-1');

    for (const [verification, message] of [
      ['checking', 'Verifying signature'],
      ['verified', 'The PDF is unmodified'],
      ['invalid', 'Signature invalid'],
      ['unavailable', 'Could not verify'],
    ] as const) {
      rerender(
        <I18nextProvider i18n={i18n}>
          <MemoSigningDialog
            {...dialogProps({
              mode: 'history',
              stage: 'idle',
              historyState: 'ready',
              signatures: [{ ...signature, verification }],
              onVerify,
            })}
          />
        </I18nextProvider>
      );
      expect(screen.getByText(message)).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'Verify signature' })).toHaveAttribute('aria-busy', 'false');

    rerender(
      <I18nextProvider i18n={i18n}>
        <MemoSigningDialog
          {...dialogProps({
            mode: 'history',
            stage: 'idle',
            historyState: 'ready',
            signatures: [{ ...signature, verification: 'checking' }],
            onVerify,
          })}
        />
      </I18nextProvider>
    );
    expect(screen.getByRole('button', { name: 'Verify signature' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText(/certificate|serial|common name|B-T/i)).not.toBeInTheDocument();
  });
});
