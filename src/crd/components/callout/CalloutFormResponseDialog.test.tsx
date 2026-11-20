import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import type { FormResponseView } from '@/crd/components/callout/calloutFormTypes';
import { CalloutFormResponseDialog } from './CalloutFormResponseDialog';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

const columns = [
  { questionID: 'q1', prompt: 'Name', removed: false },
  { questionID: 'q2', prompt: 'Colour', removed: false },
];

const response: FormResponseView = {
  id: 'r1',
  createdDate: new Date('2026-02-03T09:00:00Z'),
  respondent: { id: 'u1', name: 'Ada' },
  answers: [{ questionID: 'q1', prompt: 'Name', type: 'SHORT_TEXT', text: 'Ada L', selectedLabels: [] }],
};

const renderDialog = (props: Partial<React.ComponentProps<typeof CalloutFormResponseDialog>> = {}) => {
  const onDelete = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <CalloutFormResponseDialog
      open={true}
      onOpenChange={onOpenChange}
      response={response}
      formTitle="Intake"
      columns={columns}
      canModerate={false}
      onDelete={onDelete}
      deletedUserLabel="Deleted user"
      {...props}
    />
  );
  return { onDelete, onOpenChange };
};

describe('CalloutFormResponseDialog', () => {
  test('shows the respondent, the answers and the no-answer text', () => {
    renderDialog();
    expect(screen.getByText('formResponses.singleTitle')).toBeInTheDocument();
    expect(screen.getByText('Ada L')).toBeInTheDocument();
    expect(screen.getByText('formResponses.noAnswer')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'formResponses.delete' })).toBeNull();
  });

  test('moderators can delete after confirming, which also closes the dialog', async () => {
    const { onDelete, onOpenChange } = renderDialog({ canModerate: true });

    await userEvent.click(screen.getByRole('button', { name: 'formResponses.delete' }));
    expect(onDelete).not.toHaveBeenCalled();
    const confirm = await screen.findByRole('alertdialog');
    await userEvent.click(within(confirm).getByRole('button', { name: 'formResponses.deleteConfirm.confirm' }));

    await waitFor(() => expect(onDelete).toHaveBeenCalledWith('r1'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test('a deleted respondent is labelled', () => {
    renderDialog({ response: { ...response, respondent: null } });
    expect(screen.getAllByText('Deleted user').length).toBeGreaterThan(0);
  });

  test('numbers the questions and lists each selected option of a choice answer', () => {
    renderDialog({
      columns: [...columns, { questionID: 'q3', prompt: 'Toppings', removed: false }],
      response: {
        ...response,
        answers: [
          ...response.answers,
          { questionID: 'q3', prompt: 'Toppings', type: 'MULTIPLE_CHOICE', selectedLabels: ['Cheese', 'Ham'] },
        ],
      },
    });

    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('3.')).toBeInTheDocument();
    const options = screen.getAllByRole('listitem');
    expect(options.map(option => option.textContent)).toEqual(['Cheese', 'Ham']);
  });

  test('shows the Form title as heading context', () => {
    renderDialog();
    expect(screen.getByText('Intake')).toBeInTheDocument();
  });
});
