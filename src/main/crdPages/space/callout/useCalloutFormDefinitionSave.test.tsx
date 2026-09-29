import { ApolloError } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CalloutFormQuestionType } from '@/core/apollo/generated/graphql-schema';
import { createFormOption, createFormQuestion, DEFAULT_FORM_SETTINGS } from '@/crd/forms/callout/formValues';
import { translateFormDefinitionError, useCalloutFormDefinitionSave } from './useCalloutFormDefinitionSave';

const updateCalloutForm = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateCalloutFormMutation: () => [updateCalloutForm],
}));

beforeEach(() => {
  updateCalloutForm.mockReset();
});

describe('useCalloutFormDefinitionSave', () => {
  it('saves the definition through updateCalloutForm with ids preserved and never touches updateCallout', async () => {
    updateCalloutForm.mockResolvedValue({ data: { updateCalloutForm: { id: 'form-1' } } });
    const { result } = renderHook(() => useCalloutFormDefinitionSave());

    const outcome = await result.current.save(
      'form-1',
      [
        createFormQuestion({
          id: 'q1',
          prompt: ' Pick ',
          type: 'SINGLE_CHOICE',
          options: [createFormOption('A', 'o1'), createFormOption('B')],
        }),
      ],
      { ...DEFAULT_FORM_SETTINGS, state: 'CLOSED' }
    );

    expect(outcome.ok).toBe(true);
    expect(updateCalloutForm).toHaveBeenCalledTimes(1);
    const call = updateCalloutForm.mock.calls[0][0];
    expect(call.context).toEqual({ skipGlobalErrorHandler: true });
    expect(call.variables.formData).toMatchObject({
      formID: 'form-1',
      questions: [
        {
          id: 'q1',
          prompt: 'Pick',
          type: CalloutFormQuestionType.SingleChoice,
          options: [{ id: 'o1', label: 'A' }, { label: 'B' }],
        },
      ],
      settings: { state: 'CLOSED' },
    });
  });

  it('returns the reason code of a rejected save instead of throwing', async () => {
    updateCalloutForm.mockRejectedValue(
      new ApolloError({
        graphQLErrors: [
          new GraphQLError('rejected', { extensions: { details: { code: 'FORM_VISIBILITY_WIDENING_BLOCKED' } } }),
        ],
      })
    );
    const { result } = renderHook(() => useCalloutFormDefinitionSave());

    const outcome = await result.current.save('form-1', [createFormQuestion({ prompt: 'x' })], DEFAULT_FORM_SETTINGS);

    expect(outcome).toMatchObject({ ok: false, code: 'FORM_VISIBILITY_WIDENING_BLOCKED' });
  });

  it('an error without a reason code still fails cleanly with no code', async () => {
    updateCalloutForm.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useCalloutFormDefinitionSave());

    const outcome = await result.current.save('form-1', [createFormQuestion({ prompt: 'x' })], DEFAULT_FORM_SETTINGS);

    expect(outcome).toMatchObject({ ok: false, code: undefined });
  });
});

describe('translateFormDefinitionError', () => {
  const t = ((key: string) => key) as never;

  it('maps each definition reason code to its localized key', () => {
    for (const code of [
      'FORM_VISIBILITY_WIDENING_BLOCKED',
      'FORM_RESPONSE_MODE_SWITCH_BLOCKED',
      'FORM_QUESTION_TYPE_LOCKED',
      'FORM_UNKNOWN_QUESTION_ID',
      'FORM_UNKNOWN_OPTION_ID',
      'FORM_QUESTIONS_COUNT',
      'FORM_OPTIONS_COUNT',
      'FORM_OPTIONS_DUPLICATE',
    ] as const) {
      expect(translateFormDefinitionError(code, t)).toBe(`formForm.errors.${code}`);
    }
  });

  it('falls back to the generic message for an unknown or missing code', () => {
    expect(translateFormDefinitionError(undefined, t)).toBe('formForm.errors.saveFailed');
    expect(translateFormDefinitionError('FORM_CLOSED', t)).toBe('formForm.errors.saveFailed');
  });
});
