import type { FormQuestionKind, FormResponseVisibilityValue, FormStateValue } from '@/crd/forms/callout/types';

/** Plain view types of the Form response surfaces. CRD components never see GraphQL types. */

export type FormQuestionView = {
  id: string;
  prompt: string;
  explanation?: string;
  type: FormQuestionKind;
  required: boolean;
  options: { id: string; label: string }[];
};

/** One answer as submitted: text for text questions, option ids for choice questions. */
export type FormAnswerInput = {
  questionID: string;
  text?: string;
  selectedOptionIDs?: string[];
};

/** An answer as stored (snapshot of the question at answer time). */
export type FormAnswerView = {
  questionID: string;
  prompt: string;
  type: FormQuestionKind;
  text?: string;
  selectedLabels: string[];
};

export type FormRespondentView = {
  id: string;
  name: string;
  avatarUrl?: string;
  profileUrl?: string;
};

export type FormResponseView = {
  id: string;
  createdDate: Date | string;
  /** Absent once the respondent's account is deleted. */
  respondent?: FormRespondentView | null;
  answers: FormAnswerView[];
};

export type { FormResponseVisibilityValue, FormStateValue };
