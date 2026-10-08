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

  test('a closed form explains it, shows read-only inputs and no footer', () => {
    renderFillIn({ state: 'CLOSED', canSubmit: false });

    expect(screen.getByText('formFillIn.closedNotice')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Your name/ })).toHaveAttribute('readonly');
    expect(screen.queryByRole('button', { name: 'formFillIn.submit' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'formFillIn.cancel' })).toBeNull();
    expect(screen.getByRole('radio', { name: 'Red' })).toBeDisabled();
  });

  test('an unpublished form explains it and has no footer', () => {
    renderFillIn({ published: false, canSubmit: false });
    expect(screen.getByText('formFillIn.draftNotice')).toBeInTheDocument();
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

  test('gives every mounted copy of the form its own element ids', async () => {
    const user = userEvent.setup();
    const props = {
      questions,
      visibility: 'ADMINS' as const,
      spaceName: 'Garden',
      state: 'OPEN' as const,
      published: true,
      canSubmit: true,
      submitting: false,
      onSubmit: vi.fn(),
    };
    const { container } = render(
      <>
        <CalloutFormFillIn {...props} />
        <CalloutFormFillIn {...props} />
      </>
    );

    const ids = [...container.querySelectorAll('[id]')].map(el => el.id);
    expect(new Set(ids).size).toBe(ids.length);

    const [, dialogRed] = screen.getAllByRole('radio', { name: 'Red' });
    await user.click(screen.getAllByText('Red')[1]);
    expect(dialogRed).toBeChecked();
    expect(screen.getAllByRole('radio', { name: 'Red' })[0]).not.toBeChecked();
  });

  test('numbers each question in order', () => {
    renderFillIn();

    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('4.')).toBeInTheDocument();
  });

  test('Cancel clears every answer only after it is confirmed', async () => {
    const user = userEvent.setup();
    renderFillIn();
    const reset = screen.getByRole('button', { name: 'formFillIn.cancel' });
    expect(reset).toBeDisabled();

    await user.type(screen.getByRole('textbox', { name: /Your name/ }), 'Ada');
    await user.click(screen.getByRole('radio', { name: 'Red' }));
    await user.click(reset);

    await user.click(screen.getByRole('button', { name: 'formFillIn.resetConfirm.confirm' }));
    expect(screen.getByRole('textbox', { name: /Your name/ })).toHaveValue('');
    expect(screen.getByRole('radio', { name: 'Red' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'formFillIn.cancel' })).toBeDisabled();
  });

  test('dismissing the Cancel confirmation keeps the answers', async () => {
    const user = userEvent.setup();
    renderFillIn();

    await user.type(screen.getByRole('textbox', { name: /Your name/ }), 'Ada');
    await user.click(screen.getByRole('button', { name: 'formFillIn.cancel' }));
    await user.keyboard('{Escape}');

    expect(screen.getByRole('textbox', { name: /Your name/ })).toHaveValue('Ada');
  });

  test('the footer holds Cancel and Submit Form', () => {
    renderFillIn();
    expect(screen.getByRole('button', { name: 'formFillIn.cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'formFillIn.submit' })).toHaveAttribute('type', 'submit');
  });

  test('the length counter appears only near the limit', async () => {
    const user = userEvent.setup();
    renderFillIn();
    const name = screen.getByRole('textbox', { name: /Your name/ });

    await user.type(name, 'Ada');
    expect(screen.queryByText('3/512')).toBeNull();

    await user.clear(name);
    await user.click(name);
    await user.paste('x'.repeat(420));
    expect(screen.getByText('420/512')).toBeInTheDocument();
  });

  test('the footer row holds the visibility notice next to the buttons', () => {
    renderFillIn();
    const submit = screen.getByRole('button', { name: 'formFillIn.submit' });
    expect(submit.closest('div')?.parentElement).toContainElement(screen.getByText('formFillIn.noticeAdmins'));
  });

  test('a closed form shows only the closed message in the footer row', () => {
    renderFillIn({ state: 'CLOSED', canSubmit: false });
    const closed = screen.getByText('formFillIn.closedNotice');
    expect(closed).toHaveClass('ml-auto');
    expect(screen.queryByText('formFillIn.noticeAdmins')).toBeNull();
    expect(screen.queryByRole('button', { name: 'formFillIn.submit' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'formFillIn.cancel' })).toBeNull();
  });
});
