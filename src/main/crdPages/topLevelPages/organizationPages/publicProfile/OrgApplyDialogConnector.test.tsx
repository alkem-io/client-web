import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import profilePagesEn from '@/crd/i18n/profilePages/profilePages.en.json';
import spaceEn from '@/crd/i18n/space/space.en.json';

const runApply = vi.fn();
const notify = vi.fn();

vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notify }));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useApplyForEntryRoleOnRoleSetMutation: () => [runApply, { loading: false }],
}));

import { OrgApplyDialogConnector } from './OrgApplyDialogConnector';

// Real i18next with BOTH namespaces the two dialogs read: proving the organization copy
// wins over the Space defaults needs the Space strings present, not a `t` that echoes keys.
const i18n = createInstance();

beforeAll(async () => {
  await i18n.init({
    lng: 'en',
    resources: { en: { 'crd-profilePages': profilePagesEn, 'crd-space': spaceEn } },
    interpolation: { escapeValue: false },
  });
});

const SEEDED_QUESTION = 'Why do you want to join?';

const renderConnector = (onSubmitted = vi.fn()) =>
  render(
    <I18nextProvider i18n={i18n}>
      <OrgApplyDialogConnector
        open={true}
        onOpenChange={vi.fn()}
        organizationName="Acme"
        roleSetId="rs-1"
        applicationForm={{ questions: [{ question: SEEDED_QUESTION, required: false, maxLength: 500, sortOrder: 0 }] }}
        onSubmitted={onSubmitted}
      />
    </I18nextProvider>
  );

// The wording rule for organization surfaces: "associate(s)", never Space words.
const SPACE_WORDS = /\bmembers?\b|\bcommunity\b|\bjoin\b/i;

beforeEach(() => {
  vi.clearAllMocks();
  runApply.mockResolvedValue({ data: {} });
});

describe('OrgApplyDialogConnector — organization copy, not the Space dialog wording', () => {
  it('titles, cues and labels the form as an application to associate', () => {
    renderConnector();
    const dialog = screen.getByRole('dialog');

    expect(within(dialog).getByText('Apply to associate with Acme')).toBeInTheDocument();
    expect(
      within(dialog).getByText("Tell the organisation why you'd like to associate — optional.")
    ).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Message (optional)')).toBeInTheDocument();
    expect(within(dialog).queryByText(SEEDED_QUESTION)).not.toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Submit application' })).toBeInTheDocument();
    expect(dialog.textContent).not.toMatch(SPACE_WORDS);
  });

  it('persists the answer under the form\u2019s own question and owns the failure handling', async () => {
    const onSubmitted = vi.fn();
    renderConnector(onSubmitted);

    fireEvent.change(screen.getByLabelText('Message (optional)'), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit application' }));

    await waitFor(() => expect(onSubmitted).toHaveBeenCalledTimes(1));
    expect(runApply).toHaveBeenCalledWith({
      variables: { roleSetId: 'rs-1', questions: [{ name: SEEDED_QUESTION, value: 'Hello', sortOrder: 0 }] },
      context: { skipGlobalErrorHandler: true },
    });
  });

  it('confirms the submission in organization words', async () => {
    renderConnector();

    fireEvent.click(screen.getByRole('button', { name: 'Submit application' }));

    const dialog = await screen.findByRole('dialog', { name: 'Application submitted' });
    expect(within(dialog).getByText('Your application to associate with Acme has been submitted.')).toBeInTheDocument();
    const review = within(dialog).getByText(/The organisation's admins will review it/);
    expect(review).toHaveTextContent(/be listed as an associate/);
    expect(review.querySelector('svg.lucide-bell')).not.toBeNull();
    expect(dialog.textContent).not.toMatch(SPACE_WORDS);
  });

  it('toasts exactly once when the application is refused', async () => {
    runApply.mockRejectedValueOnce(new Error('nope'));
    renderConnector();

    fireEvent.click(screen.getByRole('button', { name: 'Submit application' }));

    await waitFor(() => expect(notify).toHaveBeenCalledTimes(1));
    expect(notify).toHaveBeenCalledWith("Couldn't submit — try again", 'error');
    expect(screen.getByText('Apply to associate with Acme')).toBeInTheDocument();
  });
});
