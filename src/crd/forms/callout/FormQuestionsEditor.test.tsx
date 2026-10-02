import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { createFormOption, createFormQuestion, FORM_QUESTIONS_MAX } from '@/crd/forms/callout/formValues';
import type { FormQuestionValue } from '@/crd/forms/callout/types';
import { FormQuestionsEditor } from './FormQuestionsEditor';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params && 'number' in params ? `${key}#${params.number}` : key,
  }),
}));

function Harness({
  initial,
  typeLockedQuestionIds,
  errors,
  onChangeSpy,
}: {
  initial: FormQuestionValue[];
  typeLockedQuestionIds?: string[];
  errors?: Record<string, string | undefined>;
  onChangeSpy?: (questions: FormQuestionValue[]) => void;
}) {
  const [questions, setQuestions] = useState(initial);
  return (
    <FormQuestionsEditor
      questions={questions}
      onChange={next => {
        onChangeSpy?.(next);
        setQuestions(next);
      }}
      typeLockedQuestionIds={typeLockedQuestionIds}
      errors={errors}
    />
  );
}

const q = (prompt: string, overrides: Partial<FormQuestionValue> = {}) => createFormQuestion({ prompt, ...overrides });

describe('FormQuestionsEditor', () => {
  test('adds a question with the default short-text shape', async () => {
    const onChange = vi.fn();
    render(<Harness initial={[q('First')]} onChangeSpy={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'formForm.addQuestion' }));

    const next = onChange.mock.calls.at(-1)?.[0] as FormQuestionValue[];
    expect(next).toHaveLength(2);
    expect(next[1]).toMatchObject({ prompt: '', type: 'SHORT_TEXT', required: false, options: [] });
    expect(screen.getByText('formForm.questionNumber#2')).toBeInTheDocument();
  });

  test('disables add at the maximum question count', () => {
    render(<Harness initial={Array.from({ length: FORM_QUESTIONS_MAX }, (_, i) => q(`Question ${i}`))} />);
    expect(screen.getByRole('button', { name: 'formForm.addQuestion' })).toBeDisabled();
  });

  test('editing the prompt and toggling required updates the value', async () => {
    const onChange = vi.fn();
    render(<Harness initial={[q('')]} onChangeSpy={onChange} />);

    await userEvent.type(screen.getByLabelText('formForm.promptLabel'), 'Name');
    await userEvent.click(screen.getByRole('switch'));

    const last = onChange.mock.calls.at(-1)?.[0] as FormQuestionValue[];
    expect(last[0]).toMatchObject({ prompt: 'Name', required: true });
  });

  test('the last remaining question cannot be removed', () => {
    render(<Harness initial={[q('Only')]} />);
    expect(screen.getByRole('button', { name: 'formForm.removeQuestion' })).toBeDisabled();
  });

  test('removing a question asks for confirmation first', async () => {
    const onChange = vi.fn();
    render(<Harness initial={[q('One'), q('Two')]} onChangeSpy={onChange} />);

    await userEvent.click(screen.getAllByRole('button', { name: 'formForm.removeQuestion' })[0]);
    expect(onChange).not.toHaveBeenCalled();

    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText('formForm.removeQuestionConfirm.descriptionWithText')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'formForm.removeQuestion' }));

    const next = onChange.mock.calls.at(-1)?.[0] as FormQuestionValue[];
    expect(next.map(x => x.prompt)).toEqual(['Two']);
  });

  test('cancelling the confirmation keeps the question', async () => {
    const onChange = vi.fn();
    render(<Harness initial={[q('One'), q('Two')]} onChangeSpy={onChange} />);

    await userEvent.click(screen.getAllByRole('button', { name: 'formForm.removeQuestion' })[0]);
    await screen.findByRole('alertdialog');
    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('formForm.questionNumber#2')).toBeInTheDocument();
  });

  test('a choice question shows its options with bounds: add, and remove blocked at the minimum', async () => {
    const onChange = vi.fn();
    const question = q('Pick', {
      type: 'SINGLE_CHOICE',
      options: [createFormOption('A'), createFormOption('B')],
    });
    render(<Harness initial={[question]} onChangeSpy={onChange} />);

    expect(screen.getByLabelText('formForm.optionLabel#1')).toHaveValue('A');
    for (const button of screen.getAllByRole('button', { name: 'formForm.removeOption' })) {
      expect(button).toBeDisabled();
    }

    await userEvent.click(screen.getByRole('button', { name: 'formForm.addOption' }));
    const next = onChange.mock.calls.at(-1)?.[0] as FormQuestionValue[];
    expect(next[0].options).toHaveLength(3);
    for (const button of screen.getAllByRole('button', { name: 'formForm.removeOption' })) {
      expect(button).toBeEnabled();
    }
  });

  test('removing an option is confirmed and then applied', async () => {
    const onChange = vi.fn();
    const question = q('Pick', {
      type: 'MULTIPLE_CHOICE',
      options: [createFormOption('A'), createFormOption('B'), createFormOption('C')],
    });
    render(<Harness initial={[question]} onChangeSpy={onChange} />);

    await userEvent.click(screen.getAllByRole('button', { name: 'formForm.removeOption' })[1]);
    const dialog = await screen.findByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'formForm.removeOption' }));

    const next = onChange.mock.calls.at(-1)?.[0] as FormQuestionValue[];
    expect(next[0].options.map(o => o.label)).toEqual(['A', 'C']);
  });

  test('a type-locked question has a disabled type select and the locked hint', () => {
    const locked = q('Locked', { id: 'server-1', type: 'LONG_TEXT' });
    const free = q('Free');
    render(<Harness initial={[locked, free]} typeLockedQuestionIds={['server-1']} />);

    const selects = screen.getAllByRole('combobox', { name: 'formForm.typeLabel' });
    expect(selects[0]).toBeDisabled();
    expect(selects[1]).toBeEnabled();
  });

  test('renders the list-level, per-question and per-option errors with associations', () => {
    const question = q('', { type: 'SINGLE_CHOICE', options: [createFormOption('A'), createFormOption('')] });
    render(
      <Harness
        initial={[question]}
        errors={{
          questions: 'count problem',
          '0.prompt': 'prompt problem',
          '0.options': 'options problem',
          '0.options.1': 'option problem',
        }}
      />
    );

    expect(screen.getByText('count problem')).toBeInTheDocument();
    expect(screen.getByText('options problem')).toBeInTheDocument();
    const prompt = screen.getByLabelText('formForm.promptLabel');
    expect(prompt).toHaveAttribute('aria-invalid', 'true');
    expect(prompt.getAttribute('aria-describedby')).toBeTruthy();
    expect(document.getElementById(prompt.getAttribute('aria-describedby') ?? '')).toHaveTextContent('prompt problem');
    expect(screen.getByLabelText('formForm.optionLabel#2')).toHaveAttribute('aria-invalid', 'true');
  });

  test('shows the character counter for the prompt', () => {
    render(<Harness initial={[q('abcd')]} />);
    expect(screen.getByText('4/512')).toBeInTheDocument();
  });
});
