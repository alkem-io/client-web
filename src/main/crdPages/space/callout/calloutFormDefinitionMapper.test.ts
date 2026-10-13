import { describe, expect, it } from 'vitest';
import {
  CalloutFormQuestionType,
  CalloutFormResponseMode,
  CalloutFormResponseVisibility,
  CalloutFormState,
} from '@/core/apollo/generated/graphql-schema';
import { createFormOption, createFormQuestion } from '@/crd/forms/callout/formValues';
import type { FormQuestionValue, FormSettingsValue } from '@/crd/forms/callout/types';
import type { CalloutFormDetailsModel } from '@/domain/collaboration/callout-form/models/CalloutFormModels';
import {
  formHeaderFromServer,
  formQuestionsFromServer,
  formSettingsFromServer,
  mapFormValuesToCreateInput,
  mapFormValuesToUpdateInput,
} from './calloutFormDefinitionMapper';

const form: CalloutFormDetailsModel = {
  id: 'form-1',
  title: 'Q4 planning',
  description: null,
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
    defaultCollapsed: true,
  },
};

const definition = (
  questions: FormQuestionValue[],
  settings: FormSettingsValue,
  header: { title?: string; description?: string } = {}
) => ({ title: header.title ?? '', description: header.description ?? '', questions, settings });

describe('calloutFormDefinitionMapper', () => {
  it('round-trips the server definition to builder values and back to an update input with ids preserved', () => {
    const questions = formQuestionsFromServer(form);
    const settings = formSettingsFromServer(form.settings);

    expect(settings).toEqual({
      visibility: 'MEMBERS',
      responseMode: 'MULTIPLE',
      state: 'CLOSED',
      defaultCollapsed: true,
    });
    expect(questions[0]).toMatchObject({ id: 'q1', key: 'q1', explanation: '', type: 'SINGLE_CHOICE', required: true });
    expect(questions[0].options.map(o => o.id)).toEqual(['o1', 'o2']);

    expect(mapFormValuesToUpdateInput('form-1', definition(questions, settings, { title: 'Q4 planning' }))).toEqual({
      formID: 'form-1',
      title: 'Q4 planning',
      description: '',
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
        defaultCollapsed: true,
      },
    });
  });

  it('new questions and options carry no id, so the server treats them as new', () => {
    const input = mapFormValuesToUpdateInput(
      'form-1',
      definition(
        [
          ...formQuestionsFromServer(form),
          createFormQuestion({
            prompt: 'New',
            type: 'MULTIPLE_CHOICE',
            options: [createFormOption('x'), createFormOption('y')],
          }),
        ],
        formSettingsFromServer(form.settings)
      )
    );

    const added = input.questions?.[2];
    expect(added?.id).toBeUndefined();
    expect(added?.options?.map(o => o.id)).toEqual([undefined, undefined]);
  });

  it('omits the questions on a settings-only save, so a concurrent question edit by another admin survives', () => {
    // The editor was opened with these questions; rebuilding them (new client keys) must still count as unchanged.
    const initialQuestions = formQuestionsFromServer(form);
    const input = mapFormValuesToUpdateInput(
      'form-1',
      definition(formQuestionsFromServer(form), {
        visibility: 'MEMBERS',
        responseMode: 'MULTIPLE',
        state: 'OPEN',
        defaultCollapsed: false,
      }),
      { title: '', description: '', questions: initialQuestions }
    );

    expect(input).not.toHaveProperty('questions');
    expect(input.settings?.state).toBe(CalloutFormState.Open);
  });

  it('treats whitespace-only edits that map to the same input as unchanged', () => {
    const initialQuestions = formQuestionsFromServer(form);
    const padded = initialQuestions.map(question => ({ ...question, prompt: `  ${question.prompt} ` }));

    expect(
      mapFormValuesToUpdateInput('form-1', definition(padded, formSettingsFromServer(form.settings)), {
        title: '',
        description: '',
        questions: initialQuestions,
      })
    ).not.toHaveProperty('questions');
  });

  it('sends the full question list when any question changed', () => {
    const initialQuestions = formQuestionsFromServer(form);
    const edited = initialQuestions.map((question, index) =>
      index === 1 ? { ...question, required: true } : question
    );

    const input = mapFormValuesToUpdateInput('form-1', definition(edited, formSettingsFromServer(form.settings)), {
      title: '',
      description: '',
      questions: initialQuestions,
    });

    expect(input.questions?.map(q => [q.id, q.required])).toEqual([
      ['q1', true],
      ['q2', true],
    ]);
  });

  it('round-trips the title, description and defaultCollapsed: null maps to an empty string and back', () => {
    const header = formHeaderFromServer(form);
    expect(header).toEqual({ formTitle: 'Q4 planning', formDescription: '' });
    expect(formHeaderFromServer({ title: undefined, description: 'Tell us' })).toEqual({
      formTitle: '',
      formDescription: 'Tell us',
    });

    const input = mapFormValuesToUpdateInput(
      'form-1',
      definition(formQuestionsFromServer(form), formSettingsFromServer(form.settings), {
        title: ` ${header.formTitle} `,
        description: header.formDescription,
      })
    );
    expect(input.title).toBe('Q4 planning');
    // An empty value is sent, so clearing the title or description reaches the server.
    expect(input.description).toBe('');
    expect(input.settings?.defaultCollapsed).toBe(true);
  });

  it('create sends the trimmed title and description and leaves out empty ones', () => {
    const settings = formSettingsFromServer(form.settings);
    const withHeader = mapFormValuesToCreateInput(
      definition(formQuestionsFromServer(form), settings, { title: '  Survey ', description: ' About us\n ' })
    );
    expect(withHeader).toMatchObject({
      title: 'Survey',
      description: 'About us',
      settings: { defaultCollapsed: true },
    });

    const without = mapFormValuesToCreateInput(definition(formQuestionsFromServer(form), settings, { title: '  ' }));
    expect(without.title).toBeUndefined();
    expect(without.description).toBeUndefined();
  });

  it('omits an unchanged title and description, so a concurrent edit by another admin survives', () => {
    const questions = formQuestionsFromServer(form);
    const initial = { title: 'Q4 planning', description: 'About', questions };
    const input = mapFormValuesToUpdateInput(
      'form-1',
      // Whitespace-only differences map to the same value: still unchanged.
      definition(questions, formSettingsFromServer(form.settings), { title: ' Q4 planning ', description: 'About ' }),
      initial
    );

    expect(input).not.toHaveProperty('title');
    expect(input).not.toHaveProperty('description');
    expect(input).not.toHaveProperty('questions');
    expect(input.settings).toBeDefined();
  });

  it('sends only the changed header part; clearing sends an empty string', () => {
    const questions = formQuestionsFromServer(form);
    const initial = { title: 'Q4 planning', description: 'About', questions };

    const renamed = mapFormValuesToUpdateInput(
      'form-1',
      definition(questions, formSettingsFromServer(form.settings), { title: ' Q1 planning ', description: 'About' }),
      initial
    );
    expect(renamed.title).toBe('Q1 planning');
    expect(renamed).not.toHaveProperty('description');

    const cleared = mapFormValuesToUpdateInput(
      'form-1',
      definition(questions, formSettingsFromServer(form.settings), { title: 'Q4 planning', description: '  ' }),
      initial
    );
    expect(cleared).not.toHaveProperty('title');
    expect(cleared.description).toBe('');
  });
});
