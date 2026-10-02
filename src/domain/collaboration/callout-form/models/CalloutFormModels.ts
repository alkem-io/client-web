import type {
  CalloutFormQuestionType,
  CalloutFormResponseMode,
  CalloutFormResponseVisibility,
  CalloutFormState,
} from '@/core/apollo/generated/graphql-schema';

export type CalloutFormQuestionOptionModel = {
  id: string;
  label: string;
};

export type CalloutFormQuestionModel = {
  id: string;
  prompt: string;
  explanation?: string | null;
  type: CalloutFormQuestionType;
  required: boolean;
  options?: CalloutFormQuestionOptionModel[] | null;
};

export type CalloutFormSettingsModel = {
  visibility: CalloutFormResponseVisibility;
  responseMode: CalloutFormResponseMode;
  state: CalloutFormState;
};

/** The form definition only; responses are read through the dedicated root lookup. */
export type CalloutFormDetailsModel = {
  id: string;
  questions: CalloutFormQuestionModel[];
  settings: CalloutFormSettingsModel;
};

export type CalloutFormAnswerModel = {
  questionID: string;
  prompt: string;
  type: CalloutFormQuestionType;
  text?: string | null;
  selectedOptions?: CalloutFormQuestionOptionModel[] | null;
};

export type CalloutFormResponseModel = {
  id: string;
  createdDate: Date;
  createdBy?: {
    id: string;
    profile?: {
      id: string;
      displayName: string;
      url: string;
      avatar?: { id: string; uri: string } | null;
    } | null;
  } | null;
  answers: CalloutFormAnswerModel[];
};
