import { describe, expect, it } from 'vitest';
import { CalloutFormQuestionType } from '@/core/apollo/generated/graphql-schema';
import { mapFormQuestionsToViews, mapFormResponseToView } from './calloutFormResponseMapper';

describe('calloutFormResponseMapper', () => {
  it('maps the form definition to question views, defaulting missing explanation and options', () => {
    const views = mapFormQuestionsToViews({
      id: 'f',
      questions: [
        { id: 'q1', prompt: 'Name', explanation: null, type: CalloutFormQuestionType.ShortText, required: true },
        {
          id: 'q2',
          prompt: 'Pick',
          explanation: 'One',
          type: CalloutFormQuestionType.SingleChoice,
          required: false,
          options: [{ id: 'o1', label: 'A' }],
        },
      ],
      settings: { visibility: 'ADMINS', responseMode: 'SINGLE', state: 'OPEN' } as never,
    });

    expect(views).toEqual([
      { id: 'q1', prompt: 'Name', explanation: undefined, type: 'SHORT_TEXT', required: true, options: [] },
      {
        id: 'q2',
        prompt: 'Pick',
        explanation: 'One',
        type: 'SINGLE_CHOICE',
        required: false,
        options: [{ id: 'o1', label: 'A' }],
      },
    ]);
  });

  it('maps a response with a respondent, text and selected option labels', () => {
    const view = mapFormResponseToView({
      id: 'r1',
      createdDate: new Date('2026-01-01'),
      createdBy: {
        id: 'u1',
        profile: { id: 'p1', displayName: 'Ada', url: '/u/ada', avatar: { id: 'v1', uri: 'https://x/a.png' } },
      },
      answers: [
        {
          questionID: 'q1',
          prompt: 'Name',
          type: CalloutFormQuestionType.ShortText,
          text: 'Ada',
          selectedOptions: null,
        },
        {
          questionID: 'q2',
          prompt: 'Pick',
          type: CalloutFormQuestionType.MultipleChoice,
          text: null,
          selectedOptions: [
            { id: 'o1', label: 'A' },
            { id: 'o2', label: 'B' },
          ],
        },
      ],
    });

    expect(view.respondent).toEqual({ id: 'u1', name: 'Ada', avatarUrl: 'https://x/a.png', profileUrl: '/u/ada' });
    expect(view.answers).toEqual([
      { questionID: 'q1', prompt: 'Name', type: 'SHORT_TEXT', text: 'Ada', selectedLabels: [] },
      { questionID: 'q2', prompt: 'Pick', type: 'MULTIPLE_CHOICE', text: undefined, selectedLabels: ['A', 'B'] },
    ]);
  });

  it('a deleted respondent maps to null', () => {
    expect(
      mapFormResponseToView({ id: 'r', createdDate: new Date(), createdBy: null, answers: [] }).respondent
    ).toBeNull();
  });
});
