import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import type { FormQuestionView, FormResponseView } from '@/crd/components/callout/calloutFormTypes';
import { CalloutFormOwnResponses } from './CalloutFormOwnResponses';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

const questions: FormQuestionView[] = [
  { id: 'q1', prompt: 'Your name', type: 'SHORT_TEXT', required: true, options: [] },
  { id: 'q2', prompt: 'Toppings', type: 'MULTIPLE_CHOICE', required: false, options: [] },
];

const responses: FormResponseView[] = [
  {
    id: 'r1',
    createdDate: new Date('2026-01-02T10:00:00Z'),
    answers: [
      { questionID: 'q1', prompt: 'Your name', type: 'SHORT_TEXT', text: 'Ada', selectedLabels: [] },
      { questionID: 'gone', prompt: 'Old question', type: 'SHORT_TEXT', text: 'legacy', selectedLabels: [] },
    ],
  },
  { id: 'r2', createdDate: '2026-01-03T10:00:00Z', answers: [] },
];

describe('CalloutFormOwnResponses', () => {
  test('renders each response read-only by prompt, with no-answer text and snapshot-only questions', () => {
    render(<CalloutFormOwnResponses responses={responses} questions={questions} onWithdraw={vi.fn()} />);

    expect(screen.getAllByRole('button', { name: 'formFillIn.ownResponses.withdraw' })).toHaveLength(2);
    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('Old question')).toBeInTheDocument();
    expect(screen.getByText('legacy')).toBeInTheDocument();
    expect(screen.getAllByText('formFillIn.noAnswer').length).toBeGreaterThan(0);
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  test('withdrawing asks for confirmation before calling back', async () => {
    const onWithdraw = vi.fn();
    render(<CalloutFormOwnResponses responses={responses} questions={questions} onWithdraw={onWithdraw} />);

    await userEvent.click(screen.getAllByRole('button', { name: 'formFillIn.ownResponses.withdraw' })[1]);
    expect(onWithdraw).not.toHaveBeenCalled();

    const dialog = await screen.findByRole('alertdialog');
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'formFillIn.ownResponses.withdrawConfirm.confirm' })
    );

    expect(onWithdraw).toHaveBeenCalledWith('r2');
  });

  test('cancelling the confirmation withdraws nothing', async () => {
    const onWithdraw = vi.fn();
    render(<CalloutFormOwnResponses responses={responses} questions={questions} onWithdraw={onWithdraw} />);

    await userEvent.click(screen.getAllByRole('button', { name: 'formFillIn.ownResponses.withdraw' })[0]);
    await screen.findByRole('alertdialog');
    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(onWithdraw).not.toHaveBeenCalled();
  });

  test('announces a closed Form while still offering withdraw (US2-AS9)', () => {
    render(
      <CalloutFormOwnResponses responses={responses} questions={questions} onWithdraw={vi.fn()} status="CLOSED" />
    );

    expect(screen.getByText('formFillIn.closedBadge')).toBeInTheDocument();
    expect(screen.getByText('formFillIn.closedNotice')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'formFillIn.ownResponses.withdraw' })[0]).toBeEnabled();
  });

  test('announces an unpublished Post', () => {
    render(<CalloutFormOwnResponses responses={responses} questions={questions} onWithdraw={vi.fn()} status="DRAFT" />);

    expect(screen.getByText('formFillIn.draftBadge')).toBeInTheDocument();
    expect(screen.getByText('formFillIn.draftNotice')).toBeInTheDocument();
  });

  test('shows no state notice for an open Form', () => {
    render(<CalloutFormOwnResponses responses={responses} questions={questions} onWithdraw={vi.fn()} />);

    expect(screen.queryByText('formFillIn.closedBadge')).toBeNull();
    expect(screen.queryByText('formFillIn.draftBadge')).toBeNull();
  });
});
