import { gql, InMemoryCache } from '@apollo/client';
import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import { typePolicies } from '@/core/apollo/config/typePolicies';
import {
  CalloutContributionsDocument,
  CalloutDetailsDocument,
  MemoDetailsDocument,
  MemoSignedCopiesDocument,
  MemoSigningAttemptDocument,
} from '@/core/apollo/generated/apollo-hooks';

const countDocumentBacked = (signatures: Array<{ document?: unknown }> | undefined) =>
  signatures?.filter(signature => signature.document).length ?? 0;

describe('memo signing browse and return GraphQL contracts', () => {
  it('selects complete actionable history rows for the dedicated signed-copies connector', () => {
    const source = print(MemoSignedCopiesDocument);
    expect(source).toMatch(/signatures\s*\{[^}]*id\s+document\s*\{[^}]*id[^}]*url[^}]*displayName/s);
    expect(source).toMatch(/actor\s*\{[^}]*profile\s*\{[^}]*displayName[^}]*url/s);
    expect(source).toMatch(/updatedDate/);
  });

  it('selects only the fields needed to count actionable saved copies in callout details', () => {
    expect(print(CalloutDetailsDocument)).toMatch(/memo\s*\{[^}]*signatures\s*\{\s*id\s+document\s*\{\s*id\s*\}/s);
  });

  it('selects only the fields needed to count actionable saved copies in memo contributions', () => {
    expect(print(CalloutContributionsDocument)).toMatch(
      /fragment CalloutContributionsMemoCard on Memo\s*\{[^}]*signatures\s*\{\s*id\s+document\s*\{\s*id\s*\}/s
    );
  });

  it('selects the exact returned attempt document and attribution for saved-success actions', () => {
    const source = print(MemoSigningAttemptDocument);

    expect(source).toMatch(/signingAttempt[^}]*id\s+status\s+document\s*\{[^}]*id[^}]*url[^}]*displayName/s);
    expect(source).toMatch(/actor\s*\{[^}]*profile\s*\{[^}]*displayName[^}]*url/s);
    expect(source).toMatch(/updatedDate/);
  });

  it('propagates one MemoDetails signature refresh into mounted callout and contribution counts by Memo identity', () => {
    const cache = new InMemoryCache({ typePolicies });
    const calloutMemoSeed = gql`
      query CalloutMemoCountSeed($calloutId: UUID!) {
        lookup {
          callout(ID: $calloutId) {
            id
            framing {
              id
              memo {
                id
                signatures {
                  id
                  document {
                    id
                  }
                }
              }
            }
          }
        }
      }
    `;
    const contributionMemoSeed = gql`
      query ContributionMemoCountSeed(
        $calloutId: UUID!
        $includeMemo: Boolean!
        $filter: [CalloutContributionType!] = [LINK, WHITEBOARD, MEMO, POST, COLLABORA_DOCUMENT]
        $limit: Int
      ) {
        lookup {
          callout(ID: $calloutId) {
            id
            contributions(filter: { types: $filter }, limit: $limit) {
              id
              sortOrder
              memo @include(if: $includeMemo) {
                id
                signatures {
                  id
                  document {
                    id
                  }
                }
              }
            }
          }
        }
      }
    `;
    const initialSignatures = [
      {
        __typename: 'MemoSignature',
        id: 'signed-1',
        document: { __typename: 'Document', id: 'document-1' },
      },
    ];

    cache.writeQuery({
      query: calloutMemoSeed,
      variables: { calloutId: 'callout-1' },
      data: {
        lookup: {
          __typename: 'LookupQueryResults',
          callout: {
            __typename: 'Callout',
            id: 'callout-1',
            framing: {
              __typename: 'CalloutFraming',
              id: 'framing-1',
              memo: { __typename: 'Memo', id: 'memo-1', signatures: initialSignatures },
            },
          },
        },
      } as never,
    });
    cache.writeQuery({
      query: contributionMemoSeed,
      variables: { calloutId: 'callout-1', includeMemo: true },
      data: {
        lookup: {
          __typename: 'LookupQueryResults',
          callout: {
            __typename: 'Callout',
            id: 'callout-1',
            contributions: [
              {
                __typename: 'CalloutContribution',
                id: 'contribution-1',
                sortOrder: 0,
                memo: { __typename: 'Memo', id: 'memo-1', signatures: initialSignatures },
              },
            ],
          },
        },
      } as never,
    });

    const calloutCounts: number[] = [];
    const contributionCounts: number[] = [];
    const stopCalloutWatch = cache.watch({
      query: CalloutDetailsDocument,
      variables: { calloutId: 'callout-1', withClassification: false },
      optimistic: false,
      returnPartialData: true,
      immediate: true,
      callback: result => {
        const memo = (result.result as never as { lookup?: { callout?: { framing?: { memo?: { signatures?: [] } } } } })
          .lookup?.callout?.framing?.memo;
        calloutCounts.push(countDocumentBacked(memo?.signatures));
      },
    });
    const stopContributionWatch = cache.watch({
      query: CalloutContributionsDocument,
      variables: { calloutId: 'callout-1', includeMemo: true },
      optimistic: false,
      returnPartialData: true,
      immediate: true,
      callback: result => {
        const memo = (
          result.result as never as {
            lookup?: { callout?: { contributions?: Array<{ memo?: { signatures?: [] } }> } };
          }
        ).lookup?.callout?.contributions?.[0]?.memo;
        contributionCounts.push(countDocumentBacked(memo?.signatures));
      },
    });

    cache.writeQuery({
      query: MemoDetailsDocument,
      variables: { id: 'memo-1' },
      data: {
        lookup: {
          __typename: 'LookupQueryResults',
          memo: {
            __typename: 'Memo',
            id: 'memo-1',
            createdDate: '2026-09-10T08:00:00.000Z',
            profile: {
              __typename: 'Profile',
              id: 'profile-1',
              displayName: 'Decision memo',
              preview: null,
              storageBucket: { __typename: 'StorageBucket', id: 'bucket-1' },
              url: '/memo-1',
            },
            markdown: 'Decision',
            authorization: { __typename: 'Authorization', id: 'authorization-1', myPrivileges: [] },
            contentUpdatePolicy: 'CONTRIBUTORS',
            createdBy: null,
            signatures: [
              {
                __typename: 'MemoSignature',
                id: 'signed-1',
                updatedDate: '2026-09-10T09:00:00.000Z',
                actor: null,
                document: {
                  __typename: 'Document',
                  id: 'document-1',
                  url: '/document-1',
                  displayName: 'Signed copy 1.pdf',
                },
              },
              {
                __typename: 'MemoSignature',
                id: 'signed-2',
                updatedDate: '2026-09-10T10:00:00.000Z',
                actor: null,
                document: {
                  __typename: 'Document',
                  id: 'document-2',
                  url: '/document-2',
                  displayName: 'Signed copy 2.pdf',
                },
              },
              {
                __typename: 'MemoSignature',
                id: 'incomplete-1',
                updatedDate: '2026-09-10T11:00:00.000Z',
                actor: null,
                document: null,
              },
            ],
          },
        },
      } as never,
    });

    expect(calloutCounts[calloutCounts.length - 1]).toBe(2);
    expect(contributionCounts[contributionCounts.length - 1]).toBe(2);
    stopCalloutWatch();
    stopContributionWatch();
  });
});
