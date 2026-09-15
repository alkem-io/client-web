import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { formatISO, parseISO } from 'date-fns';
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

type SigningDialogOverrides = Partial<Omit<Extract<MemoSigningDialogProps, { mode: 'signing' }>, 'mode'>> & {
  mode?: 'signing';
};
type HistoryDialogOverrides = Partial<Omit<Extract<MemoSigningDialogProps, { mode: 'history' }>, 'mode'>> & {
  mode: 'history';
};
type DialogOverrides = SigningDialogOverrides | HistoryDialogOverrides;

const dialogProps = (props: DialogOverrides = {}): MemoSigningDialogProps => {
  if (props.mode === 'history') {
    return {
      ...props,
      open: props.open ?? true,
      mode: 'history',
      historyState: props.historyState ?? 'ready',
      signatures: props.signatures ?? [],
      onOpenChange: props.onOpenChange ?? vi.fn(),
      onVerify: props.onVerify ?? vi.fn(),
      onDownload: props.onDownload ?? vi.fn(),
      onClose: props.onClose ?? vi.fn(),
    };
  }

  return {
    ...props,
    open: props.open ?? true,
    mode: 'signing',
    stage: props.stage ?? 'preparing',
    onOpenChange: props.onOpenChange ?? vi.fn(),
    onContinue: props.onContinue ?? vi.fn(),
    onVerify: props.onVerify ?? vi.fn(),
    onClose: props.onClose ?? vi.fn(),
  };
};

const renderDialog = (props: DialogOverrides = {}) =>
  render(
    <I18nextProvider i18n={i18n}>
      <MemoSigningDialog {...dialogProps(props)} />
    </I18nextProvider>
  );

describe('MemoSigningDialog', () => {
  it.each([
    'signing',
    'history',
  ] as const)('separates readable signed-copy metadata from the action toolbar in %s', mode => {
    const signature = {
      id: 'signature-layout',
      document: { id: 'document-layout', url: '/signed.pdf' },
      actor: {
        profile: { displayName: 'Alexandra van der Meer — International Collaboration Coordinator', url: '/user' },
      },
      updatedDate: '2026-09-14T21:21:22Z',
      recordedAt: '09/14/2026, 23:21:22',
    };
    renderDialog(
      mode === 'history' ? { mode, signatures: [signature] } : { stage: 'signed', completedSignature: signature }
    );

    const card = screen.getByRole('listitem');
    expect(card).toHaveClass('flex-col');
    expect(card).not.toHaveClass('sm:flex-row');
    const signer = screen.getByRole('link', { name: signature.actor.profile.displayName });
    expect(signer).toHaveClass('break-words');
    expect(signer).not.toHaveClass('truncate');
    const actions = screen.getByRole('link', { name: 'Open signed PDF' }).parentElement;
    expect(actions).toHaveClass('flex-wrap', 'gap-2');
    expect(actions).not.toContainElement(signer);
  });

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
    expect(screen.getByRole('link', { name: 'Open in a new tab' })).toHaveAttribute(
      'href',
      '/api/public/rest/content-signing/attempt-1/snapshot'
    );

    await userEvent.click(screen.getByRole('button', { name: 'Continue to Cleverbase' }));
    expect(onContinue).toHaveBeenCalledTimes(1);

    rerender(
      <I18nextProvider i18n={i18n}>
        <MemoSigningDialog
          open={true}
          mode="signing"
          stage="continuing"
          previewUrl="/api/public/rest/content-signing/attempt-1/snapshot"
          onOpenChange={vi.fn()}
          onContinue={onContinue}
          onVerify={vi.fn()}
          onClose={vi.fn()}
        />
      </I18nextProvider>
    );
    expect(screen.getByRole('button', { name: 'Continuing to Cleverbase' })).toBeDisabled();
  });

  it('lets the stacked mobile preview and journey scroll without changing the desktop row layout', () => {
    renderDialog({
      stage: 'preview',
      previewUrl: '/api/public/rest/content-signing/attempt-1/snapshot',
    });

    const previewAndJourney = screen.getByTitle('Memo signing preview').parentElement?.parentElement;
    expect(previewAndJourney).toHaveClass('overflow-y-auto', 'lg:flex-row', 'lg:overflow-hidden');
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
      historyState: 'ready',
      onOpenChange,
      signatures: [{ id: 'pending-1', updatedDate: '2026-09-05T10:30:00.000Z', recordedAt: '' }],
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Signed copies' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Close' })).toHaveLength(2);
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it.each([
    ['loading', 'Loading signed copies'],
    ['error', 'Signed copies could not be loaded'],
    ['ready', 'No signed copies have been saved yet'],
  ] as const)('shows an explicit %s history state without any signing action', (historyState, message) => {
    renderDialog({ mode: 'history', historyState, signatures: [] });

    expect(screen.getByText(message)).toBeInTheDocument();
    if (historyState === 'error') {
      expect(screen.getByRole('alert')).toHaveTextContent(message);
    }
    expect(screen.queryByRole('button', { name: 'Continue to Cleverbase' })).not.toBeInTheDocument();
  });

  it('binds saved success actions to the returned attempt', () => {
    renderDialog({
      mode: 'signing',
      stage: 'signed',
      completedSignature: {
        id: 'returned-attempt',
        document: { id: 'returned-document', url: '/api/private/returned.pdf', displayName: 'returned.pdf' },
        updatedDate: '2026-09-10T09:00:00.000Z',
        recordedAt: '09/10/2026, 09:00:00',
      },
    });

    expect(screen.getByRole('heading', { name: "It's signed" })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open signed PDF' })).toHaveAttribute('href', '/api/private/returned.pdf');
    expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Close' })).toHaveLength(2);
    expect(screen.getByText('Your signed document is ready.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Back to memo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue to Cleverbase' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Review the exact PDF copy before starting/)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Signed copies' })).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/unchanged|unmodified|certificate|revocation|qualification/i);
  });

  it('delegates an authenticated download instead of relying on the anchor download attribute', async () => {
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

  it('never renders blank signed metadata and uses a date-fns machine datetime', () => {
    const updatedDate = '2026-09-05T10:30:00.000Z';
    const machineDateTime = formatISO(parseISO(updatedDate));

    renderDialog({
      mode: 'history',
      historyState: 'ready',
      signatures: [
        {
          id: 'attempt-1',
          document: { id: 'document-1', url: '/api/private/file-1', displayName: 'signed-copy.pdf' },
          updatedDate,
          recordedAt: '',
        },
      ],
    });

    expect(screen.getByText(machineDateTime)).toHaveAttribute('datetime', machineDateTime);
  });

  it.each([
    'history',
    'signing',
  ] as const)('renders an honest visible fallback without a time element for an invalid %s timestamp', mode => {
    const signature = {
      id: 'attempt-invalid-date',
      document: { id: 'document-invalid-date', url: '/api/private/invalid-date.pdf' },
      updatedDate: 'not-a-date',
      recordedAt: '',
    };

    renderDialog(
      mode === 'history'
        ? { mode: 'history', historyState: 'ready', signatures: [signature] }
        : { mode: 'signing', stage: 'signed', completedSignature: signature }
    );

    const metadata = screen.getByText('—').closest('p');
    expect(metadata).toHaveTextContent('Signed: —');
    expect(metadata?.querySelector('time')).toBeNull();
  });

  it('keeps a signed-success result within a scrollable dialog body', () => {
    renderDialog({
      mode: 'signing',
      stage: 'signed',
      completedSignature: {
        id: 'attempt-1',
        document: { id: 'document-1', url: '/api/private/document-1' },
        updatedDate: '2026-09-14T09:00:00.000Z',
        recordedAt: '09/14/2026, 09:00:00',
      },
    });

    const dialog = screen.getByRole('dialog', { name: "It's signed" });
    const body = screen.getByRole('list').parentElement;
    expect(dialog).toHaveClass('flex', 'max-h-[88vh]', 'overflow-hidden');
    expect(body).toHaveClass('min-h-0', 'flex-1', 'overflow-y-auto');
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
      downloadingDocumentIds: new Set(['document-1']),
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
    [
      'pending',
      "Signing is still in progress. Close this result, then open the relevant memo's signed copies later to check for a completed copy.",
    ],
    ['cancelled', 'Signing was cancelled'],
    ['failed', 'The PDF could not be signed'],
    ['expired', 'This signing attempt expired'],
    ['prepare-error', 'The exact memo copy could not be prepared'],
    ['continue-error', 'The signing session could not be started. Prepare a fresh copy and try again.'],
    ['return-error', 'The signing result could not be loaded'],
  ] as const)('renders the %s server outcome', (stage, message) => {
    renderDialog({ stage });

    const outcome = screen.getByText(message);
    expect(outcome).toBeInTheDocument();
    expect(outcome.closest('[aria-live="polite"]')).toHaveAttribute('aria-atomic', 'true');
    expect(screen.queryByText(/Review the exact PDF copy before starting/)).not.toBeInTheDocument();
  });

  it('keeps a pending return truthful after its single-use URL token has been consumed', () => {
    renderDialog({ stage: 'pending' });

    expect(
      screen.getByText(
        "Signing is still in progress. Close this result, then open the relevant memo's signed copies later to check for a completed copy."
      )
    ).toBeInTheDocument();
    expect(screen.queryByText(/reload|refresh|retry|automatic(?:ally)? update/i)).not.toBeInTheDocument();
  });

  it('announces an asynchronously resolved signing outcome', () => {
    const { rerender } = renderDialog({ stage: 'checking' });

    rerender(
      <I18nextProvider i18n={i18n}>
        <MemoSigningDialog {...dialogProps({ stage: 'failed' })} />
      </I18nextProvider>
    );

    const outcome = screen.getByText('The PDF could not be signed');
    expect(outcome.closest('[aria-live="polite"]')).toHaveAttribute('aria-atomic', 'true');
  });

  it.each([
    ['checking', 'Checking the signing result'],
    [
      'pending',
      "Signing is still in progress. Close this result, then open the relevant memo's signed copies later to check for a completed copy.",
    ],
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

  it('lists independent signed copies with Alkemio attribution and signer-name fallbacks', () => {
    renderDialog({
      mode: 'history',
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
        {
          id: 'attempt-3',
          document: { id: 'document-3', url: '/api/private/file-3', displayName: 'Signed decision 3.pdf' },
          actor: null,
          updatedDate: '2026-09-05T12:30:00.000Z',
          recordedAt: '09/05/2026, 12:30:00',
        },
      ],
    });

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'Alice Example' })).toHaveAttribute('href', '/user/alice');
    expect(screen.getByText('Former member')).toBeInTheDocument();
    expect(screen.getByText('Unknown signer')).toBeInTheDocument();
    expect(screen.getAllByText(/Signed:/)).toHaveLength(3);
    expect(screen.getByText('09/05/2026, 10:30:00')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Open signed PDF' })).toHaveLength(3);
    expect(screen.getAllByRole('button', { name: 'Download' })).toHaveLength(3);
    expect(screen.getByText('Downloaded PDFs can be checked with compatible PDF signature tools.')).toBeInTheDocument();
    expect(screen.getByText(/Each row is a signed PDF copy/)).toBeInTheDocument();
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
      ['verified', 'Cryptographic signature verified'],
      ['invalid', 'Signature invalid'],
      ['unavailable', 'Could not verify'],
    ] as const) {
      rerender(
        <I18nextProvider i18n={i18n}>
          <MemoSigningDialog
            {...dialogProps({
              mode: 'history',
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

  it('visibly serializes verification while one signed copy is being checked', async () => {
    const onVerify = vi.fn();
    const signatures = [
      {
        id: 'attempt-1',
        document: { id: 'document-1', url: '/api/private/file-1', displayName: 'First.pdf' },
        updatedDate: '2026-09-05T10:30:00.000Z',
        recordedAt: '09/05/2026, 10:30:00',
        verification: 'checking' as const,
      },
      {
        id: 'attempt-2',
        document: { id: 'document-2', url: '/api/private/file-2', displayName: 'Second.pdf' },
        updatedDate: '2026-09-05T11:30:00.000Z',
        recordedAt: '09/05/2026, 11:30:00',
      },
    ];

    renderDialog({ mode: 'history', historyState: 'ready', signatures, onVerify, verifyDisabled: true });

    const [activeVerify, otherVerify] = screen.getAllByRole('button', { name: 'Verify signature' });
    expect(activeVerify).toBeDisabled();
    expect(activeVerify).toHaveAttribute('aria-busy', 'true');
    expect(otherVerify).toBeDisabled();
    expect(otherVerify).toHaveAttribute('aria-busy', 'false');
    await userEvent.click(otherVerify);
    expect(onVerify).not.toHaveBeenCalled();
  });

  it('explains the real handoff once in a responsive document-first preview', () => {
    renderDialog({
      stage: 'preview',
      previewUrl: '/api/public/rest/content-signing/attempt-1/snapshot',
    });

    expect(screen.getByText('What happens next')).toBeInTheDocument();
    expect(screen.getByText('Cleverbase opens')).toBeInTheDocument();
    expect(screen.getByText('You confirm your identity')).toBeInTheDocument();
    expect(screen.getByText('You return to Alkemio')).toBeInTheDocument();
    expect(screen.getByText('The memo remains editable')).toBeInTheDocument();
    expect(screen.getAllByText(/Review the PDF/)).toHaveLength(1);
  });

  it('keeps the celebration meaningful with reduced motion and no trust overclaim', () => {
    renderDialog({
      stage: 'signed',
      completedSignature: {
        id: 'attempt-1',
        document: { id: 'document-1', url: '/api/private/document-1' },
        updatedDate: '2026-09-14T09:00:00.000Z',
        recordedAt: '09/14/2026, 09:00:00',
        verification: 'verified',
      },
    });

    expect(screen.getByTestId('memo-signing-success-mark')).toHaveClass('motion-reduce:animate-none');
    expect(screen.getByText('Cryptographic signature verified')).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(
      /unchanged|unmodified|certificate|trust path|revocation|qualification|identity verified|privacy/i
    );
  });
});
