import { describe, expect, it } from 'vitest';
import {
  CalloutFormQuestionType,
  CalloutFormResponseMode,
  CalloutFormResponseVisibility,
  CalloutFormState,
} from '@/core/apollo/generated/graphql-schema';
import { createFormOption, createFormQuestion } from '@/crd/forms/callout/formValues';
import type { CalloutFormDetailsModel } from '@/domain/collaboration/callout-form/models/CalloutFormModels';
import {
  formQuestionsFromServer,
  formSettingsFromServer,
  mapFormValuesToUpdateInput,
} from './calloutFormDefinitionMapper';

const form: CalloutFormDetailsModel = {
  id: 'form-1',
  questions: [
    {
      id: 'q1',
      prompt: 'Pick',
      explanation: null,
      type: CalloutFormQuestionType.SingleChoice,
      required: true,
      options: [
        { id: 'o1', label: 'A' },
        { id: 'o2', label: 'B' },
      ],
    },
    { id: 'q2', prompt: 'Why', explanation: 'Tell us', type: CalloutFormQuestionType.LongText, required: false },
  ],
  settings: {
    visibility: CalloutFormResponseVisibility.Members,
    responseMode: CalloutFormResponseMode.Multiple,
    state: CalloutFormState.Closed,
  },
};

describe('calloutFormDefinitionMapper', () => {
  it('round-trips the server definition to builder values and back to an update input with ids preserved', () => {
    const questions = formQuestionsFromServer(form);
    const settings = formSettingsFromServer(form.settings);

    expect(settings).toEqual({ visibility: 'MEMBERS', responseMode: 'MULTIPLE', state: 'CLOSED' });
    expect(questions[0]).toMatchObject({ id: 'q1', key: 'q1', explanation: '', type: 'SINGLE_CHOICE', required: true });
    expect(questions[0].options.map(o => o.id)).toEqual(['o1', 'o2']);

    expect(mapFormValuesToUpdateInput('form-1', questions, settings)).toEqual({
      formID: 'form-1',
      questions: [
        {
          id: 'q1',
          prompt: 'Pick',
          explanation: undefined,
          type: CalloutFormQuestionType.SingleChoice,
          required: true,
          options: [
            { id: 'o1', label: 'A' },
            { id: 'o2', label: 'B' },
          ],
        },
        {
          id: 'q2',
          prompt: 'Why',
          explanation: 'Tell us',
          type: CalloutFormQuestionType.LongText,
          required: false,
          options: undefined,
        },
      ],
      settings: {
        visibility: CalloutFormResponseVisibility.Members,
        responseMode: CalloutFormResponseMode.Multiple,
        state: CalloutFormState.Closed,
      },
    });
  });

  it('new questions and options carry no id, so the server treats them as new', () => {
    const input = mapFormValuesToUpdateInput(
      'form-1',
      [
        ...formQuestionsFromServer(form),
        createFormQuestion({
          prompt: 'New',
          type: 'MULTIPLE_CHOICE',
          options: [createFormOption('x'), createFormOption('y')],
        }),
      ],
      formSettingsFromServer(form.settings)
    );

    const added = input.questions?.[2];
    expect(added?.id).toBeUndefined();
    expect(added?.options?.map(o => o.id)).toEqual([undefined, undefined]);
  });
});
