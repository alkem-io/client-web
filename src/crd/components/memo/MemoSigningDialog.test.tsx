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

const renderDialog = (props: Partial<MemoSigningDialogProps> = {}) =>
  render(
    <I18nextProvider i18n={i18n}>
      <MemoSigningDialog
        open={true}
        stage="preparing"
        signatures={[]}
        onContinue={vi.fn()}
        onClose={vi.fn()}
        {...props}
      />
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
          onContinue={onContinue}
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
    const onClose = vi.fn();
    renderDialog({
      stage: 'idle',
      onClose,
      signatures: [{ id: 'pending-1', updatedDate: '2026-09-05T10:30:00.000Z' }],
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Signed copies' })).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it.each([
    ['checking', 'Checking the signing result'],
    ['pending', 'Signing is still in progress. Reload this page to check again.'],
    ['signed', 'The PDF was signed successfully'],
    ['cancelled', 'Signing was cancelled'],
    ['failed', 'The PDF could not be signed'],
    ['expired', 'This signing attempt expired'],
    ['prepare-error', 'The exact memo copy could not be prepared'],
    ['continue-error', 'The signing session could not be started'],
    ['return-error', 'The signing result could not be loaded'],
  ] as const)('renders the %s server outcome', (stage, message) => {
    renderDialog({ stage });

    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('lists independent signed copies with Alkemio attribution and a deleted-user fallback', () => {
    renderDialog({
      stage: 'signed',
      signatures: [
        {
          id: 'attempt-1',
          document: { url: '/api/private/file-1' },
          actor: { profile: { displayName: 'Alice Example', url: '/user/alice' } },
          updatedDate: '2026-09-05T10:30:00.000Z',
        },
        {
          id: 'attempt-2',
          document: { url: '/api/private/file-2' },
          updatedDate: '2026-09-05T11:30:00.000Z',
        },
      ],
    });

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Alice Example' })).toHaveAttribute('href', '/user/alice');
    expect(screen.getByText('Deleted user')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Download signed PDF' })).toHaveLength(2);
    expect(
      screen.getByText('Downloaded PDFs can be independently verified with standard PDF tools.')
    ).toBeInTheDocument();
    expect(screen.getByText(/Each signed PDF is a separate copy; the memo remains editable/)).toBeInTheDocument();
    expect(screen.queryByText(/certificate|serial|common name/i)).not.toBeInTheDocument();
  });
});
