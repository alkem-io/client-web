import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { createFormOption, createFormQuestion } from '@/crd/forms/callout/formValues';
import type { FormQuestionValue } from '@/crd/forms/callout/types';
import { FormQuestionsEditor } from './FormQuestionsEditor';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// jsdom has no layout, so a real drag cannot be simulated. The mock captures every
// DndContext's drag-end handler in render order (the question list first, then one
// per choice question's option list) so the reorder logic itself is exercised.
const dragEndHandlers: Array<(event: { active: { id: string }; over: { id: string } | null }) => void> = [];

vi.mock('@dnd-kit/core', async importOriginal => {
  const original = await importOriginal<typeof import('@dnd-kit/core')>();
  return {
    ...original,
    DndContext: ({ children, onDragEnd }: { children: ReactNode; onDragEnd: (event: never) => void }) => {
      dragEndHandlers.push(onDragEnd as never);
      return <>{children}</>;
    },
  };
});

describe('FormQuestionsEditor reordering', () => {
  test('dropping a question on another reorders the list', () => {
    dragEndHandlers.length = 0;
    const one = createFormQuestion({ prompt: 'One' });
    const two = createFormQuestion({ prompt: 'Two' });
    const three = createFormQuestion({ prompt: 'Three' });
    const onChange = vi.fn();

    render(<FormQuestionsEditor questions={[one, two, three]} onChange={onChange} />);
    dragEndHandlers[0]({ active: { id: one.key }, over: { id: three.key } });

    const next = onChange.mock.calls[0][0] as FormQuestionValue[];
    expect(next.map(q => q.prompt)).toEqual(['Two', 'Three', 'One']);
  });

  test('dropping on itself or outside a target changes nothing', () => {
    dragEndHandlers.length = 0;
    const one = createFormQuestion({ prompt: 'One' });
    const two = createFormQuestion({ prompt: 'Two' });
    const onChange = vi.fn();

    render(<FormQuestionsEditor questions={[one, two]} onChange={onChange} />);
    dragEndHandlers[0]({ active: { id: one.key }, over: { id: one.key } });
    dragEndHandlers[0]({ active: { id: one.key }, over: null });

    expect(onChange).not.toHaveBeenCalled();
  });

  test('dropping an option reorders only that question options and keeps their ids', () => {
    dragEndHandlers.length = 0;
    const a = createFormOption('A', 'opt-a');
    const b = createFormOption('B', 'opt-b');
    const choice = createFormQuestion({ prompt: 'Pick', type: 'SINGLE_CHOICE', options: [a, b] });
    const onChange = vi.fn();

    render(<FormQuestionsEditor questions={[choice]} onChange={onChange} />);
    dragEndHandlers[1]({ active: { id: a.key }, over: { id: b.key } });

    const next = onChange.mock.calls[0][0] as FormQuestionValue[];
    expect(next[0].options.map(o => o.id)).toEqual(['opt-b', 'opt-a']);
  });
});
