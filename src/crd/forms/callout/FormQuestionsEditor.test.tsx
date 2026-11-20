import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeAll, describe, expect, test, vi } from 'vitest';
import { createFormOption, createFormQuestion, FORM_QUESTIONS_MAX } from '@/crd/forms/callout/formValues';
import type { FormQuestionValue } from '@/crd/forms/callout/types';
import { FormQuestionsEditor } from './FormQuestionsEditor';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params && 'number' in params ? `${key}#${params.number}` : key,
  }),
}));

beforeAll(() => {
  // Radix Select needs these DOM APIs, which jsdom does not implement.
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
});

function Harness({
  initial,
  answeredHintQuestionIds,
  errors,
  onChangeSpy,
  onTitleChange,
  onDescriptionChange,
}: {
  initial: FormQuestionValue[];
  answeredHintQuestionIds?: string[];
  errors?: Record<string, string | undefined>;
  onChangeSpy?: (questions: FormQuestionValue[]) => void;
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
}) {
  const [questions, setQuestions] = useState(initial);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  return (
    <FormQuestionsEditor
      title={title}
      onTitleChange={next => {
        onTitleChange?.(next);
        setTitle(next);
      }}
      description={description}
      onDescriptionChange={next => {
        onDescriptionChange?.(next);
        setDescription(next);
      }}
      questions={questions}
      onChange={next => {
        onChangeSpy?.(next);
        setQuestions(next);
      }}
      answeredHintQuestionIds={answeredHintQuestionIds}
      errors={errors}
    />
  );
}

const chooseType = async (index: number, typeKey: string) => {
  await userEvent.click(screen.getAllByRole('combobox', { name: 'formForm.typeLabel' })[index]);
  await userEvent.click(await screen.findByRole('option', { name: typeKey }));
};

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

    await userEvent.type(screen.getByLabelText('formForm.questionNumber#1'), 'Name');
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
    const prompt = screen.getByLabelText('formForm.questionNumber#1');
    expect(prompt).toHaveAttribute('aria-invalid', 'true');
    expect(prompt.getAttribute('aria-describedby')).toBeTruthy();
    expect(document.getElementById(prompt.getAttribute('aria-describedby') ?? '')).toHaveTextContent('prompt problem');
    expect(screen.getByLabelText('formForm.optionLabel#2')).toHaveAttribute('aria-invalid', 'true');
  });

  test('shows the character counter for the prompt', () => {
    render(<Harness initial={[q('abcd')]} />);
    expect(screen.getByText('4/512')).toBeInTheDocument();
  });

  test('the Form header box renders before question 1 and fires its callbacks', async () => {
    const onTitleChange = vi.fn();
    const onDescriptionChange = vi.fn();
    render(<Harness initial={[q('First')]} onTitleChange={onTitleChange} onDescriptionChange={onDescriptionChange} />);

    const title = screen.getByLabelText('formForm.title');
    const description = screen.getByLabelText('formForm.description');
    const firstPrompt = screen.getByLabelText('formForm.questionNumber#1');
    expect(title.compareDocumentPosition(firstPrompt) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(description.compareDocumentPosition(firstPrompt) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    await userEvent.type(title, 'Q4');
    await userEvent.type(description, 'Why');
    expect(onTitleChange).toHaveBeenLastCalledWith('Q4');
    expect(onDescriptionChange).toHaveBeenLastCalledWith('Why');
  });

  test('the header shows its validation messages', () => {
    render(
      <Harness initial={[q('First')]} errors={{ title: 'title too long', description: 'description too long' }} />
    );
    expect(screen.getByLabelText('formForm.title')).toHaveAccessibleDescription('title too long');
    expect(screen.getByLabelText('formForm.description')).toHaveAccessibleDescription('description too long');
  });

  test('each prompt is labelled "Question N" by position, also after a reorder', () => {
    const one = q('One');
    const two = q('Two');
    const { rerender } = render(<FormQuestionsEditor questions={[one, two]} onChange={vi.fn()} />);

    expect(screen.getByRole('textbox', { name: 'formForm.questionNumber#1' })).toHaveValue('One');
    expect(screen.getByRole('textbox', { name: 'formForm.questionNumber#2' })).toHaveValue('Two');

    rerender(<FormQuestionsEditor questions={[two, one]} onChange={vi.fn()} />);
    expect(screen.getByRole('textbox', { name: 'formForm.questionNumber#1' })).toHaveValue('Two');
    expect(screen.getByRole('textbox', { name: 'formForm.questionNumber#2' })).toHaveValue('One');
  });

  test('two columns per question: handle and delete on the left; prompt, type, required, explanation, options on the right (R21)', () => {
    render(
      <Harness
        initial={[q('Pick', { type: 'SINGLE_CHOICE', options: [createFormOption('A'), createFormOption('B')] })]}
      />
    );

    const handle = screen.getByRole('button', { name: 'formForm.dragQuestion#1' });
    const remove = screen.getByRole('button', { name: 'formForm.removeQuestion' });
    const ordered = [
      handle,
      remove,
      screen.getByRole('textbox', { name: 'formForm.questionNumber#1' }),
      screen.getByRole('combobox', { name: 'formForm.typeLabel' }),
      screen.getByRole('switch'),
      screen.getByLabelText('formForm.explanationLabel'),
      screen.getByLabelText('formForm.optionLabel#1'),
      screen.getByRole('button', { name: 'formForm.addOption' }),
    ];
    for (let i = 1; i < ordered.length; i++) {
      expect(ordered[i - 1].compareDocumentPosition(ordered[i]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }

    // The handle and the delete button share the left column; everything else is in the right column.
    const leftColumn = handle.parentElement as HTMLElement;
    expect(leftColumn).toContainElement(remove);
    expect(leftColumn).not.toContainElement(screen.getByRole('textbox', { name: 'formForm.questionNumber#1' }));
    const rightColumn = leftColumn.nextElementSibling as HTMLElement;
    expect(rightColumn).toContainElement(screen.getByLabelText('formForm.explanationLabel'));
    expect(rightColumn).toContainElement(screen.getByLabelText('formForm.optionLabel#1'));
    // "Add option" is aligned right.
    expect(screen.getByRole('button', { name: 'formForm.addOption' }).parentElement).toHaveClass('justify-end');
    // "Required" uses the small field-label size.
    expect(screen.getByText('formForm.required')).toHaveClass('text-caption');
    // The separate "Question N" title is gone: the label is the only occurrence.
    expect(screen.getAllByText('formForm.questionNumber#1')).toHaveLength(1);
  });

  test('a text question renders no options editor', () => {
    render(<Harness initial={[q('Name')]} />);
    expect(screen.queryByRole('button', { name: 'formForm.addOption' })).toBeNull();
    expect(screen.queryByText('formForm.optionsHeading')).toBeNull();
  });

  test('the delete button shows a "Remove question" tooltip', async () => {
    render(<Harness initial={[q('One'), q('Two')]} />);
    await userEvent.hover(screen.getAllByRole('button', { name: 'formForm.removeQuestion' })[0]);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('formForm.removeQuestion');
  });

  test('an empty question is removed without a confirmation', async () => {
    const onChange = vi.fn();
    render(<Harness initial={[q('One'), q('  ')]} onChangeSpy={onChange} />);

    await userEvent.click(screen.getAllByRole('button', { name: 'formForm.removeQuestion' })[1]);

    expect(screen.queryByRole('alertdialog')).toBeNull();
    const next = onChange.mock.calls.at(-1)?.[0] as FormQuestionValue[];
    expect(next.map(x => x.prompt)).toEqual(['One']);
  });

  test.each([
    ['only an explanation', q('', { explanation: 'Why it matters' })],
    [
      'only an option label',
      q('', { type: 'SINGLE_CHOICE', options: [createFormOption('Yes'), createFormOption('')] }),
    ],
  ])('a question with %s asks for confirmation; cancel keeps it', async (_label, filled) => {
    const onChange = vi.fn();
    render(<Harness initial={[q('One'), filled]} onChangeSpy={onChange} />);

    await userEvent.click(screen.getAllByRole('button', { name: 'formForm.removeQuestion' })[1]);
    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText('formForm.removeQuestionConfirm.description')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'dialogs.cancel' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: 'formForm.questionNumber#2' })).toBeInTheDocument();
  });

  test('the answer type stays changeable for a question that may have answers', () => {
    render(<Harness initial={[q('Answered', { id: 'server-1' })]} answeredHintQuestionIds={['server-1']} />);
    expect(screen.getByRole('combobox', { name: 'formForm.typeLabel' })).toBeEnabled();
  });

  test('the type-change hint appears only after the type of a listed question changes', async () => {
    render(
      <Harness
        initial={[q('Answered', { id: 'server-1' }), q('Fresh', { id: 'server-2' })]}
        answeredHintQuestionIds={['server-1']}
      />
    );
    expect(screen.queryByText('formForm.typeChangeHint')).toBeNull();

    await chooseType(1, 'formForm.type.LONG_TEXT');
    expect(screen.queryByText('formForm.typeChangeHint')).toBeNull();

    await chooseType(0, 'formForm.type.LONG_TEXT');
    const hint = screen.getByText('formForm.typeChangeHint');
    expect(hint.parentElement).toHaveAttribute('aria-live', 'polite');
  });

  test('switching a choice question to a text type keeps its options; back to choice restores them', async () => {
    const onChange = vi.fn();
    const options = [createFormOption('A', 'opt-a'), createFormOption('B', 'opt-b')];
    render(<Harness initial={[q('Pick', { type: 'MULTIPLE_CHOICE', options })]} onChangeSpy={onChange} />);

    await chooseType(0, 'formForm.type.SHORT_TEXT');
    const asText = (onChange.mock.calls.at(-1)?.[0] as FormQuestionValue[])[0];
    expect(asText.type).toBe('SHORT_TEXT');
    expect(asText.options).toEqual(options);
    expect(screen.queryByText('formForm.optionsHeading')).toBeNull();

    await chooseType(0, 'formForm.type.SINGLE_CHOICE');
    const back = (onChange.mock.calls.at(-1)?.[0] as FormQuestionValue[])[0];
    expect(back.type).toBe('SINGLE_CHOICE');
    expect(back.options).toEqual(options);
  });

  test('a text question switched to a choice type is seeded with two empty options', async () => {
    const onChange = vi.fn();
    render(<Harness initial={[q('Name')]} onChangeSpy={onChange} />);

    await chooseType(0, 'formForm.type.SINGLE_CHOICE');
    const next = (onChange.mock.calls.at(-1)?.[0] as FormQuestionValue[])[0];
    expect(next.type).toBe('SINGLE_CHOICE');
    expect(next.options.map(o => o.label)).toEqual(['', '']);
  });

  test('hidden options of a text question do not ask for confirmation on removal', async () => {
    const onChange = vi.fn();
    const hidden = q('', { type: 'SHORT_TEXT', options: [createFormOption('Yes'), createFormOption('No')] });
    render(<Harness initial={[q('One'), hidden]} onChangeSpy={onChange} />);

    await userEvent.click(screen.getAllByRole('button', { name: 'formForm.removeQuestion' })[1]);

    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect((onChange.mock.calls.at(-1)?.[0] as FormQuestionValue[]).map(x => x.prompt)).toEqual(['One']);
  });
});
