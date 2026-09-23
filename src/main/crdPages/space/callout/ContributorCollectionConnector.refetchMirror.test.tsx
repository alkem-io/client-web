/**
 * @vitest-environment jsdom
 *
 * Proves what the mirror effect in `useCrdSpaceContributors` is actually
 * FOR: keeping the already-loaded, already-active type's cards current after
 * a `refetchQueries` re-run of `ContributorCollectionByType` for that SAME
 * type — e.g. `CalloutFormConnector` refetching both
 * `ContributorCollectionConfig` and `ContributorCollectionByType` after a
 * Contributors-post save that does NOT change the default type. That refetch
 * never goes through `ensureLoaded`'s own `.then()` (no new fetch is
 * started — `requestedRef` already has the type marked as requested), so
 * only a mirror of the active lazy-query observer's `data` can pick up the
 * refreshed payload.
 *
 * Unlike `ContributorCollectionConnector.defaultTypeRefetch.test.tsx` (which
 * covers a refetch that changes the *default type*, resolved via the
 * separate `ensureLoaded(resolvedType)` effect added in corr-client-web-1),
 * this scenario keeps the resolved type unchanged so the mirror effect is
 * the only path that can pick up the new data.
 */
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { type MockedResponse, MockLink } from '@apollo/client/testing';
import { render, waitFor } from '@testing-library/react';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { typePolicies } from '@/core/apollo/config/typePolicies';
import {
  ContributorCollectionByTypeDocument,
  ContributorCollectionConfigDocument,
} from '@/core/apollo/generated/apollo-hooks';
import {
  ActorType,
  type ContributorCollectionByTypeQuery,
  type ContributorCollectionConfigQuery,
  ContributorCollectionView,
} from '@/core/apollo/generated/graphql-schema';
import spaceEnJson from '@/crd/i18n/space/space.en.json';
import { ContributorCollectionConnector } from './ContributorCollectionConnector';

const CALLOUT_ID = 'callout-1';

const configMock: MockedResponse<ContributorCollectionConfigQuery> = {
  request: { query: ContributorCollectionConfigDocument, variables: { calloutId: CALLOUT_ID } },
  result: {
    data: {
      lookup: {
        __typename: 'LookupQueryResults',
        callout: {
          __typename: 'Callout',
          id: CALLOUT_ID,
          framing: {
            __typename: 'CalloutFraming',
            id: 'framing-1',
            contributorCounts: {
              __typename: 'ContributorCollectionCounts',
              users: 1,
              organizations: 0,
              virtualContributors: 0,
            },
          },
          settings: {
            __typename: 'CalloutSettings',
            framing: {
              __typename: 'CalloutSettingsFraming',
              contributors: {
                __typename: 'CalloutContributorsSettings',
                contributorTypes: [ActorType.User],
                defaultContributorType: ActorType.User,
                defaultView: ContributorCollectionView.List,
              },
              selection: undefined,
            },
          },
        },
      },
    },
  },
};

type ContributorItem = NonNullable<
  ContributorCollectionByTypeQuery['lookup']['callout']
>['framing']['contributors'][number];

const item = (id: string, type: ActorType, name: string): ContributorItem => ({
  __typename: 'ContributorCollectionItem',
  id,
  type,
  displayName: name,
  avatarUrl: undefined,
  roleLabel: undefined,
  url: undefined,
  tagline: undefined,
  tags: undefined,
  joinedDate: undefined,
  website: undefined,
  associatesCount: undefined,
  location: undefined,
});

const byTypeMock = (items: ContributorItem[]): MockedResponse<ContributorCollectionByTypeQuery> => ({
  request: { query: ContributorCollectionByTypeDocument, variables: { calloutId: CALLOUT_ID, type: ActorType.User } },
  result: {
    data: {
      lookup: {
        __typename: 'LookupQueryResults',
        callout: {
          __typename: 'Callout',
          id: CALLOUT_ID,
          framing: { __typename: 'CalloutFraming', id: 'framing-1', contributors: items },
        },
      },
    },
  },
});

const i18n = i18next.createInstance();

beforeEach(async () => {
  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      lng: 'en',
      fallbackLng: 'en',
      ns: ['crd-space', 'crd-profilePages'],
      defaultNS: 'crd-space',
      resources: {
        en: {
          'crd-space': spaceEnJson,
          'crd-profilePages': { common: { messagePopover: {} }, orgProfile: { hero: {} } },
        },
      },
      interpolation: { escapeValue: false },
    });
  }
});

describe('ContributorCollectionConnector — refetchQueries mirrors the SAME active type', () => {
  it('renders the refreshed card list after a same-type ContributorCollectionByType refetch', async () => {
    const mocks: MockedResponse[] = [
      configMock,
      byTypeMock([item('user-ada', ActorType.User, 'Ada')]),
      // The refetch response: a genuinely changed list for the SAME type/variables
      // (e.g. CalloutFormConnector's post-save refetchQueries, default type unchanged).
      byTypeMock([item('user-ada', ActorType.User, 'Ada'), item('user-ben', ActorType.User, 'Ben')]),
    ];
    const client = new ApolloClient({
      link: new MockLink(mocks),
      cache: new InMemoryCache({ typePolicies }),
    });

    render(
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <ApolloProvider client={client}>
            <ContributorCollectionConnector calloutId={CALLOUT_ID} />
          </ApolloProvider>
        </I18nextProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(document.body.textContent).toContain('Ada'));
    expect(document.body.textContent).not.toContain('Ben');

    // Simulate CalloutFormConnector's post-save refetch — same type, no config change.
    await client.refetchQueries({ include: [ContributorCollectionByTypeDocument] });

    await waitFor(() => expect(document.body.textContent).toContain('Ben'));
  });
});
