/**
 * @vitest-environment jsdom
 *
 * Regression (corr-client-web-1): once `activeType`'s eager one-shot opener
 * was removed (39bc2c6ac) to fix the auto-heal race, `resolvedType` in
 * `ContributorCollectionConnector` became `activeType ?? defaultType` with
 * nothing re-requesting a type whose fetch was never triggered. That's fine
 * while `defaultType` is stable, but a config refetch (the same
 * `refetchQueries: ['ContributorCollectionConfig', 'ContributorCollectionByType']`
 * `CalloutFormConnector` issues on saving a Contributors post) can change
 * `defaultType` after mount while `activeType` is still null — e.g. an admin
 * flips the default type from People to Organizations. `resolvedType` then
 * points at a type `useCrdSpaceContributors` never fetched (the one-shot
 * eager effect already fired for the OLD default), the child's own
 * auto-heal never triggers (the new default's count is non-zero, so
 * `effectiveActiveType === activeType`), and the collection renders the
 * empty state under a non-zero count.
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

const configMock = (
  defaultType: ActorType,
  users: number,
  organizations: number
): MockedResponse<ContributorCollectionConfigQuery> => ({
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
              users,
              organizations,
              virtualContributors: 0,
            },
          },
          settings: {
            __typename: 'CalloutSettings',
            framing: {
              __typename: 'CalloutSettingsFraming',
              contributors: {
                __typename: 'CalloutContributorsSettings',
                contributorTypes: [ActorType.User, ActorType.Organization],
                defaultContributorType: defaultType,
                defaultView: ContributorCollectionView.List,
              },
              selection: undefined,
            },
          },
        },
      },
    },
  },
});

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

const byTypeMock = (type: ActorType, items: ContributorItem[]): MockedResponse<ContributorCollectionByTypeQuery> => ({
  request: { query: ContributorCollectionByTypeDocument, variables: { calloutId: CALLOUT_ID, type } },
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

describe('ContributorCollectionConnector — config refetch changes the default type', () => {
  it('requests and renders the new default type after a config refetch, without a tab click', async () => {
    const mocks: MockedResponse[] = [
      // Initial load: defaults to 'user', both counts non-zero so the child's
      // auto-heal never fires (the failure this test guards against only
      // shows up once auto-heal is out of the picture).
      configMock(ActorType.User, 1, 3),
      byTypeMock(ActorType.User, [item('user-ada', ActorType.User, 'Ada')]),
      // The admin edits the post and flips the default to 'organization';
      // CalloutFormConnector refetches both queries on save.
      configMock(ActorType.Organization, 1, 3),
      byTypeMock(ActorType.Organization, [item('org-1', ActorType.Organization, 'Green Future Labs')]),
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

    // Initial load settles on the People card.
    await waitFor(() => expect(document.body.textContent).toContain('Ada'));

    // Simulate the save's `refetchQueries` — re-runs the config (and the
    // lazy by-type observer's last variables, 'user') with the new default.
    await client.refetchQueries({ include: [ContributorCollectionConfigDocument] });

    // The Organizations tab's card must load and render WITHOUT any click —
    // the connector must request it on its own once `defaultType` changes.
    await waitFor(() => expect(document.body.textContent).toContain('Green Future Labs'));
    // And the stale empty state must not be what's left on screen.
    expect(document.body.textContent).not.toContain('No contributors');
  });
});
