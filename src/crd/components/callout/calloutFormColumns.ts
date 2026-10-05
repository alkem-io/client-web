import type { FormAnswerView } from '@/crd/components/callout/calloutFormTypes';
import { isChoiceKind } from '@/crd/forms/callout/formValues';

export type FormColumn = {
  questionID: string;
  prompt: string;
  /** True when the question no longer exists on the form: the column comes from response snapshots. */
  removed: boolean;
};

/**
 * Columns of the responses table: the live questions in their current order, then every question that
 * only appears in older response snapshots (removed since), in order of first appearance, labelled with
 * the prompt it had when answered. Deterministic, so paging in more responses never reorders columns.
 */
export const deriveFormColumns = (
  liveQuestions: { id: string; prompt: string }[],
  responses: { answers: Pick<FormAnswerView, 'questionID' | 'prompt'>[] }[]
): FormColumn[] => {
  const columns: FormColumn[] = liveQuestions.map(question => ({
    questionID: question.id,
    prompt: question.prompt,
    removed: false,
  }));
  const seen = new Set(columns.map(column => column.questionID));

  for (const response of responses) {
    for (const answer of response.answers) {
      if (seen.has(answer.questionID)) continue;
      seen.add(answer.questionID);
      columns.push({ questionID: answer.questionID, prompt: answer.prompt, removed: true });
    }
  }
  return columns;
};

/**
 * The displayed value of an answer, by the answer's own snapshot type — never the live question's, which may
 * have changed since: its text for a text answer, the selected option labels joined for a choice answer;
 * undefined when empty.
 */
export const answerDisplayValue = (answer: FormAnswerView | undefined): string | undefined => {
  if (!answer) return undefined;
  if (isChoiceKind(answer.type)) {
    return answer.selectedLabels.length > 0 ? answer.selectedLabels.join(', ') : undefined;
  }
  return answer.text?.trim() || undefined;
};
