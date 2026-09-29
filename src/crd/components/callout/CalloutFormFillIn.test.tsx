import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import type { FormQuestionView } from '@/crd/components/callout/calloutFormTypes';
import { CalloutFormFillIn } from './CalloutFormFillIn';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const questions: FormQuestionView[] = [
  { id: 'q-short', prompt: 'Your name', type: 'SHORT_TEXT', required: true, options: [] },
  { id: 'q-long', prompt: 'Your story', explanation: 'Be brief', type: 'LONG_TEXT', required: false, options: [] },
  {
    id: 'q-single',
    prompt: 'Favourite colour',
    type: 'SINGLE_CHOICE',
    required: true,
    options: [
      { id: 'o-red', label: 'Red' },
      { id: 'o-blue', label: 'Blue' },
    ],
  },
  {
    id: 'q-multi',
    prompt: 'Toppings',
    type: 'MULTIPLE_CHOICE',
    required: false,
    options: [
      { id: 'o-cheese', label: 'Cheese' },
      { id: 'o-ham', label: 'Ham' },
    ],
  },
];

const renderFillIn = (overrides: Partial<React.ComponentProps<typeof CalloutFormFillIn>> = {}) => {
  const onSubmit = vi.fn();
  render(
    <CalloutFormFillIn
      questions={questions}
      visibility="ADMINS"
      spaceName="Garden"
      state="OPEN"
      published={true}
      canSubmit={true}
      submitting={false}
      onSubmit={onSubmit}
      {...overrides}
    />
  );
  return { onSubmit };
};

describe('CalloutFormFillIn', () => {
  test('renders one labelled input per question type', () => {
    renderFillIn();

    expect(screen.getByRole('textbox', { name: /Your name/ })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Your story/ })).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: /Favourite colour/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Red' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /Toppings/ })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Cheese' })).toBeInTheDocument();
    expect(screen.getByText('Be brief')).toBeInTheDocument();
  });

  test('required questions expose aria-required and a visible marker; optional ones do not', () => {
    renderFillIn();

    expect(screen.getByRole('textbox', { name: /Your name/ })).toHaveAttribute('aria-required', 'true');
    expect(screen.getByRole('textbox', { name: /Your story/ })).toHaveAttribute('aria-required', 'false');
    expect(screen.getByRole('radiogroup', { name: /Favourite colour/ })).toHaveAttribute('aria-required', 'true');
    expect(screen.getAllByText('*')).toHaveLength(2);
  });

  test('shows the admins notice, or the members notice, per visibility', () => {
    const { unmount } = render(
      <CalloutFormFillIn
        questions={questions}
        visibility="ADMINS"
        spaceName="Garden"
        state="OPEN"
        published={true}
        canSubmit={true}
        submitting={false}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByText('formFillIn.noticeAdmins')).toBeInTheDocument();
    expect(screen.queryByText('formFillIn.noticeMembers')).toBeNull();
    unmount();

    renderFillIn({ visibility: 'MEMBERS' });
    expect(screen.getByText('formFillIn.noticeMembers')).toBeInTheDocument();
    expect(screen.queryByText('formFillIn.noticeAdmins')).toBeNull();
  });

  test('a required question left empty blocks the submit and marks the question', async () => {
    const { onSubmit } = renderFillIn();

    await userEvent.click(screen.getByRole('button', { name: 'formFillIn.submit' }));

    expect(onSubmit).not.toHaveBeenCalled();
    const name = screen.getByRole('textbox', { name: /Your name/ });
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(document.getElementById(name.getAttribute('aria-describedby') ?? '')).toHaveTextContent(
      'formFillIn.requiredError'
    );
    expect(screen.getByRole('radiogroup', { name: /Favourite colour/ })).toHaveAttribute('aria-invalid', 'true');
  });

  test('submits only the answered questions in the wire shape', async () => {
    const { onSubmit } = renderFillIn();

    await userEvent.type(screen.getByRole('textbox', { name: /Your name/ }), '  Ada ');
    await userEvent.click(screen.getByRole('radio', { name: 'Blue' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Cheese' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Ham' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Cheese' }));
    await userEvent.click(screen.getByRole('button', { name: 'formFillIn.submit' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith([
      { questionID: 'q-short', text: 'Ada' },
      { questionID: 'q-single', selectedOptionIDs: ['o-blue'] },
      { questionID: 'q-multi', selectedOptionIDs: ['o-ham'] },
    ]);
  });

  test('a closed form shows the badge, read-only inputs and no submit', () => {
    renderFillIn({ state: 'CLOSED', canSubmit: false });

    expect(screen.getByText('formFillIn.closedBadge')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Your name/ })).toHaveAttribute('readonly');
    expect(screen.queryByRole('button', { name: 'formFillIn.submit' })).toBeNull();
    expect(screen.queryByText('formFillIn.noticeAdmins')).toBeNull();
    expect(screen.getByRole('radio', { name: 'Red' })).toBeDisabled();
  });

  test('an unpublished form shows the not published badge', () => {
    renderFillIn({ published: false, canSubmit: false });
    expect(screen.getByText('formFillIn.draftBadge')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'formFillIn.submit' })).toBeNull();
  });

  test('without permission the questions render as read-only with an explanation', () => {
    renderFillIn({ canSubmit: false });
    expect(screen.getByText('formFillIn.cannotRespond')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Your story/ })).toHaveAttribute('readonly');
    expect(screen.queryByRole('button', { name: 'formFillIn.submit' })).toBeNull();
  });

  test('renders server-side per-question errors associated to the input', () => {
    renderFillIn({ errors: { 'q-long': 'too long' } });
    const story = screen.getByRole('textbox', { name: /Your story/ });
    expect(story).toHaveAttribute('aria-invalid', 'true');
    expect(document.getElementById(story.getAttribute('aria-describedby')?.split(' ').pop() ?? '')).toHaveTextContent(
      'too long'
    );
  });

  test('submitting disables the button and locks the inputs', () => {
    renderFillIn({ submitting: true });
    expect(screen.getByRole('button', { name: 'formFillIn.submitting' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: /Your name/ })).toHaveAttribute('readonly');
  });
});
