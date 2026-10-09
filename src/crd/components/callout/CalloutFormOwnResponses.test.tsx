import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import type { FormQuestionView, FormResponseView } from '@/crd/components/callout/calloutFormTypes';
import { CalloutFormOwnResponses } from './CalloutFormOwnResponses';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { number?: number }) =>
      options?.number === undefined ? key : `${key}:${options.number}`,
    i18n: { language: 'en' },
  }),
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

  test('numbers responses by their given position and offers loading earlier ones', async () => {
    const onLoadEarlier = vi.fn();
    render(
      <CalloutFormOwnResponses
        responses={[
          { ...responses[0], number: 1 },
          { ...responses[1], number: 60 },
        ]}
        questions={questions}
        onWithdraw={vi.fn()}
        onLoadEarlier={onLoadEarlier}
      />
    );

    expect(screen.getByText('formFillIn.ownResponses.responseNumber:1')).toBeInTheDocument();
    expect(screen.getByText('formFillIn.ownResponses.responseNumber:60')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'formFillIn.ownResponses.loadEarlier' }));
    expect(onLoadEarlier).toHaveBeenCalledTimes(1);
  });

  test('without a loader there is no earlier-responses action', () => {
    render(<CalloutFormOwnResponses responses={responses} questions={questions} onWithdraw={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'formFillIn.ownResponses.loadEarlier' })).toBeNull();
    expect(screen.getByText('formFillIn.ownResponses.responseNumber:2')).toBeInTheDocument();
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

    // The badge lives in the Form box header; the list explains the state.
    expect(screen.queryByText('formFillIn.closedBadge')).toBeNull();
    expect(screen.getByText('formFillIn.closedNotice')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'formFillIn.ownResponses.withdraw' })[0]).toBeEnabled();
  });

  test('announces an unpublished Post', () => {
    render(<CalloutFormOwnResponses responses={responses} questions={questions} onWithdraw={vi.fn()} status="DRAFT" />);

    expect(screen.getByText('formFillIn.draftNotice')).toBeInTheDocument();
  });

  test('shows no state notice for an open Form', () => {
    render(<CalloutFormOwnResponses responses={responses} questions={questions} onWithdraw={vi.fn()} />);

    expect(screen.queryByText('formFillIn.closedBadge')).toBeNull();
    expect(screen.queryByText('formFillIn.draftBadge')).toBeNull();
  });
});
