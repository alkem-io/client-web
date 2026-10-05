import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { deriveFormColumns } from '@/crd/components/callout/calloutFormColumns';
import type { FormResponseView } from '@/crd/components/callout/calloutFormTypes';
import { CalloutFormResponsesTable } from './CalloutFormResponsesTable';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

const live = [
  { id: 'q1', prompt: 'Name' },
  { id: 'q2', prompt: 'Colour' },
];

const makeResponse = (index: number, overrides: Partial<FormResponseView> = {}): FormResponseView => ({
  id: `r${index}`,
  createdDate: new Date(2026, 0, 1 + (index % 28)),
  respondent: { id: `u${index}`, name: `User ${index}` },
  answers: [{ questionID: 'q1', prompt: 'Name', type: 'SHORT_TEXT', text: `Name ${index}`, selectedLabels: [] }],
  ...overrides,
});

const renderTable = (
  responses: FormResponseView[],
  props: Partial<React.ComponentProps<typeof CalloutFormResponsesTable>> = {}
) => {
  const handlers = { onLoadMore: vi.fn(), onDelete: vi.fn(), onOpen: vi.fn() };
  render(
    <CalloutFormResponsesTable
      columns={deriveFormColumns(live, responses)}
      responses={responses}
      total={responses.length}
      hasMore={false}
      loadingMore={false}
      canModerate={false}
      deletedUserLabel="Deleted user"
      {...handlers}
      {...props}
    />
  );
  return handlers;
};

describe('CalloutFormResponsesTable', () => {
  test('renders 120 rows across two pages and offers load more only while more remain', async () => {
    const firstPage = Array.from({ length: 50 }, (_, i) => makeResponse(i));
    const all = Array.from({ length: 120 }, (_, i) => makeResponse(i));

    const handlers = { onLoadMore: vi.fn(), onDelete: vi.fn(), onOpen: vi.fn() };
    const { rerender } = render(
      <CalloutFormResponsesTable
        columns={deriveFormColumns(live, firstPage)}
        responses={firstPage}
        total={120}
        hasMore={true}
        loadingMore={false}
        canModerate={false}
        deletedUserLabel="Deleted user"
        {...handlers}
      />
    );
    expect(screen.getAllByRole('row')).toHaveLength(51);
    await userEvent.click(screen.getByRole('button', { name: 'formResponses.loadMore' }));
    expect(handlers.onLoadMore).toHaveBeenCalledTimes(1);

    rerender(
      <CalloutFormResponsesTable
        columns={deriveFormColumns(live, all)}
        responses={all}
        total={120}
        hasMore={false}
        loadingMore={false}
        canModerate={false}
        deletedUserLabel="Deleted user"
        {...handlers}
      />
    );
    expect(screen.getAllByRole('row')).toHaveLength(121);
    expect(screen.queryByRole('button', { name: 'formResponses.loadMore' })).toBeNull();
  });

  test('shows the no-answer text for an unanswered question and appends removed-question columns', () => {
    renderTable([
      makeResponse(1, {
        answers: [
          { questionID: 'gone', prompt: 'Old question', type: 'SHORT_TEXT', text: 'legacy', selectedLabels: [] },
        ],
      }),
    ]);

    expect(screen.getAllByText('formResponses.noAnswer')).toHaveLength(2);
    expect(screen.getByText('Old question')).toBeInTheDocument();
    expect(screen.getByText('legacy')).toBeInTheDocument();
    expect(screen.getByText(/formResponses.removedQuestion/)).toBeInTheDocument();
  });

  test('joins selected option labels in a choice cell', () => {
    renderTable([
      makeResponse(1, {
        answers: [{ questionID: 'q2', prompt: 'Colour', type: 'MULTIPLE_CHOICE', selectedLabels: ['Red', 'Blue'] }],
      }),
    ]);
    expect(screen.getByText('Red, Blue')).toBeInTheDocument();
  });

  test('a deleted respondent renders the deleted-user label', () => {
    renderTable([makeResponse(1, { respondent: null })]);
    expect(screen.getByText('Deleted user')).toBeInTheDocument();
  });

  test('opening a row reports its id', async () => {
    const handlers = renderTable([makeResponse(1), makeResponse(2)]);
    await userEvent.click(screen.getAllByRole('button', { name: 'formResponses.open' })[1]);
    expect(handlers.onOpen).toHaveBeenCalledWith('r2');
  });

  test('without moderation rights there is no delete action', () => {
    renderTable([makeResponse(1)]);
    expect(screen.queryByRole('button', { name: 'formResponses.delete' })).toBeNull();
  });

  test('moderators delete through a confirmation dialog', async () => {
    const handlers = renderTable([makeResponse(1), makeResponse(2)], { canModerate: true });

    await userEvent.click(screen.getAllByRole('button', { name: 'formResponses.delete' })[0]);
    expect(handlers.onDelete).not.toHaveBeenCalled();

    const dialog = await screen.findByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'formResponses.deleteConfirm.confirm' }));
    expect(handlers.onDelete).toHaveBeenCalledWith('r1');
  });

  test('cancelling the delete confirmation deletes nothing', async () => {
    const handlers = renderTable([makeResponse(1)], { canModerate: true });
    await userEvent.click(screen.getByRole('button', { name: 'formResponses.delete' }));
    await screen.findByRole('alertdialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(handlers.onDelete).not.toHaveBeenCalled();
  });

  test('an empty list renders the empty state instead of a table', () => {
    renderTable([]);
    expect(screen.getByText('formResponses.empty')).toBeInTheDocument();
    expect(screen.queryByRole('table')).toBeNull();
  });

  test('one column can mix answer shapes: each answer renders by its own snapshot type', () => {
    // q2 was a short text question when the first response came in and is a single choice now.
    const responses = [
      makeResponse(1, {
        answers: [{ questionID: 'q2', prompt: 'Colour', type: 'SHORT_TEXT', text: 'Teal-ish', selectedLabels: [] }],
      }),
      makeResponse(2, {
        answers: [{ questionID: 'q2', prompt: 'Colour', type: 'SINGLE_CHOICE', selectedLabels: ['Blue'] }],
      }),
    ];
    renderTable(responses);

    const rows = screen.getAllByRole('row').slice(1);
    expect(within(rows[0]).getByText('Teal-ish')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Blue')).toBeInTheDocument();
  });
});
