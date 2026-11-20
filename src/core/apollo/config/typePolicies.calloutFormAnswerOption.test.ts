import { InMemoryCache } from '@apollo/client';
import { describe, expect, it } from 'vitest';
import { CalloutFormResponseDetailsFragmentDoc } from '@/core/apollo/generated/apollo-hooks';
import type { CalloutFormResponseDetailsFragment } from '@/core/apollo/generated/graphql-schema';
import { typePolicies } from './typePolicies';

/**
 * A Form answer's selected options are per-response snapshots: two responses can pick the same option
 * id under different labels (the admin relabelled it in between). Default id-based normalization would
 * collapse them into one cache entity and show the same label on both responses.
 */
describe('Apollo cache identity — CalloutFormAnswerOption', () => {
  const responseFor = (id: string, label: string): CalloutFormResponseDetailsFragment =>
    ({
      __typename: 'CalloutFormResponse',
      id,
      createdDate: '2026-01-01T00:00:00.000Z',
      createdBy: null,
      answers: [
        {
          __typename: 'CalloutFormAnswer',
          questionID: 'q1',
          prompt: 'Agree?',
          type: 'SINGLE_CHOICE',
          text: null,
          selectedOptions: [{ __typename: 'CalloutFormAnswerOption', id: 'opt-x', label }],
        },
      ],
    }) as unknown as CalloutFormResponseDetailsFragment;

  it('keeps each response its own snapshot label for the same option id', () => {
    const cache = new InMemoryCache({ typePolicies });

    for (const [id, label] of [
      ['r-old', 'Yes'],
      ['r-new', 'No'],
    ]) {
      cache.writeFragment({
        id: cache.identify({ __typename: 'CalloutFormResponse', id }),
        fragment: CalloutFormResponseDetailsFragmentDoc,
        fragmentName: 'CalloutFormResponseDetails',
        data: responseFor(id, label),
      });
    }

    const labelOf = (id: string) =>
      cache.readFragment<CalloutFormResponseDetailsFragment>({
        id: cache.identify({ __typename: 'CalloutFormResponse', id }),
        fragment: CalloutFormResponseDetailsFragmentDoc,
        fragmentName: 'CalloutFormResponseDetails',
      })?.answers[0].selectedOptions?.[0].label;

    expect(labelOf('r-old')).toBe('Yes');
    expect(labelOf('r-new')).toBe('No');
  });
});
