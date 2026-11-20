import type { FormQuestionView, FormResponseView } from '@/crd/components/callout/calloutFormTypes';
import type { FormQuestionKind } from '@/crd/forms/callout/types';
import type {
  CalloutFormDetailsModel,
  CalloutFormResponseModel,
} from '@/domain/collaboration/callout-form/models/CalloutFormModels';

/** Pure mappers from the Form models to the plain view types of the CRD response surfaces. */

export const mapFormQuestionsToViews = (form: CalloutFormDetailsModel): FormQuestionView[] =>
  form.questions.map(question => ({
    id: question.id,
    prompt: question.prompt,
    explanation: question.explanation ?? undefined,
    type: question.type as FormQuestionKind,
    required: question.required,
    options: (question.options ?? []).map(option => ({ id: option.id, label: option.label })),
  }));

export const mapFormResponseToView = (response: CalloutFormResponseModel): FormResponseView => {
  const profile = response.createdBy?.profile;
  return {
    id: response.id,
    createdDate: response.createdDate,
    respondent: response.createdBy
      ? {
          id: response.createdBy.id,
          name: profile?.displayName ?? '',
          avatarUrl: profile?.avatar?.uri,
          profileUrl: profile?.url,
        }
      : null,
    answers: response.answers.map(answer => ({
      questionID: answer.questionID,
      prompt: answer.prompt,
      type: answer.type as FormQuestionKind,
      text: answer.text ?? undefined,
      selectedLabels: (answer.selectedOptions ?? []).map(option => option.label),
    })),
  };
};
