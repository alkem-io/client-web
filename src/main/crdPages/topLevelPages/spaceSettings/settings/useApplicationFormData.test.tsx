import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { GraphQLError, print } from 'graphql';
import type { PropsWithChildren } from 'react';
import { describe, expect, it } from 'vitest';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';
import { useApplicationFormData } from './useApplicationFormData';

type Request = { operationName: string; variables: Record<string, unknown>; query: string };

const form = (questions: Array<[string, boolean, number]>) => ({
  node: {
    __typename: 'Space',
    id: 'space-1',
    entityType: 'space',
    applicationForm: {
      description: 'Tell us',
      questions: questions.map(([question, required, sortOrder]) => ({
        question,
        explanation: 'kept by the server',
        required,
        max_length: 300,
        sort_order: sortOrder,
      })),
    },
  },
});

function setup(handlers: Record<string, Array<Record<string, unknown>>>) {
  const requests: Request[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          requests.push({
            operationName: operation.operationName,
            variables: operation.variables,
            query: print(operation.query),
          });
          const reply = handlers[operation.operationName]?.shift();
          const timer = setTimeout(() => {
            if (!reply) observer.error(new Error(`Unexpected ${operation.operationName}`));
            else {
              observer.next('errors' in reply ? (reply as { errors: GraphQLError[] }) : { data: reply });
              observer.complete();
            }
          }, 0);
          return () => clearTimeout(timer);
        })
    ),
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <ApolloProvider client={client}>
      <GlobalStateProvider>{children}</GlobalStateProvider>
    </ApolloProvider>
  );
  return { ...renderHook(() => useApplicationFormData('space-1'), { wrapper }), requests };
}

describe('useApplicationFormData — native Space.applicationForm', () => {
  it('reads the form of the space itself, questions in their sort order', async () => {
    const fixture = setup({
      SpaceSettingsApplicationForm: [
        form([
          ['Second', false, 2],
          ['First', true, 1],
        ]),
      ],
    });
    await waitFor(() => expect(fixture.result.current.description).toBe('Tell us'));
    expect(fixture.requests[0].variables).toEqual({ id: 'space-1' });
    expect(fixture.requests[0].query).not.toMatch(/roleSet|lookup/);
    expect(fixture.result.current.questions).toEqual([
      { question: 'First', required: true, sortOrder: 1 },
      { question: 'Second', required: false, sortOrder: 2 },
    ]);
  });

  it('writes the whole form through updateSpace(applicationForm) and clears the buffer', async () => {
    const fixture = setup({
      SpaceSettingsApplicationForm: [form([['First', true, 1]])],
      SpaceSettingsUpdateApplicationForm: [
        {
          updateSpace: {
            __typename: 'Space',
            id: 'space-1',
            applicationForm: form([['Renamed', true, 1]]).node.applicationForm,
          },
        },
      ],
    });
    await waitFor(() => expect(fixture.result.current.questions).toHaveLength(1));
    act(() => fixture.result.current.onQuestionChange(0, 'Renamed'));
    expect(fixture.result.current.isDirty).toBe(true);

    await act(() => fixture.result.current.onSave());

    const save = fixture.requests.find(r => r.operationName === 'SpaceSettingsUpdateApplicationForm');
    expect(save?.variables).toEqual({
      id: 'space-1',
      applicationForm: {
        description: 'Tell us',
        questions: [{ question: 'Renamed', explanation: '', required: true, max_length: 500, sort_order: 1 }],
      },
    });
    expect(fixture.result.current.isDirty).toBe(false);
    expect(fixture.result.current.questions[0].question).toBe('Renamed');
  });

  it('rejects a refused save and keeps the edit', async () => {
    const fixture = setup({
      SpaceSettingsApplicationForm: [form([['First', true, 1]])],
      SpaceSettingsUpdateApplicationForm: [
        { errors: [new GraphQLError('forbidden', { extensions: { code: 'FORBIDDEN' } })] },
      ],
    });
    await waitFor(() => expect(fixture.result.current.questions).toHaveLength(1));
    act(() => fixture.result.current.onDescriptionChange('Changed'));

    await act(async () => {
      await expect(fixture.result.current.onSave()).rejects.toThrow('forbidden');
    });
    expect(fixture.result.current.isDirty).toBe(true);
    expect(fixture.result.current.description).toBe('Changed');
  });
});
