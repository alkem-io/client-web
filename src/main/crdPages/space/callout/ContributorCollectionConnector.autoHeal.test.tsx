/**
 * @vitest-environment jsdom
 *
 * Regression: on a space viewed by a non-member (People count 0,
 * Organizations count 2), the People segment must auto-heal straight to
 * Organizations — never bounce back to a 'user' render after the heal has
 * already been notified.
 *
 * Root cause: two writers of `activeType` fire in the SAME commit — the one
 * where the config query lands.
 *   1. `ContributorCollection`'s own auto-heal effect (child): counts show
 *      'user' at 0 → `effectiveActiveType` becomes 'organization' →
 *      `onActiveTypeChange('organization')` → the connector's
 *      `handleActiveTypeChange` → `setActiveType('organization')`.
 *   2. The connector's OWN "open on the configured default type" effect
 *      (parent, `ContributorCollectionConnector.tsx` ~55-59): its closure
 *      still sees `activeType === null` from the same render, so it ALSO
 *      calls `setActiveType(defaultType)` = `setActiveType('user')`.
 * Child effects run before parent effects, but both fire in the same commit
 * and are batched: the parent's write (2) — later in commit order — wins,
 * so `activeType` reverts to 'user' for one more render before the child's
 * effect notices the mismatch again and re-heals. That "one more render of
 * user" is exactly the live symptom: the Organizations header already reads
 * the real count, but the list briefly (and, under the production React
 * Compiler's memoised callback identity, potentially permanently) renders
 * the empty state instead.
 *
 * This spies on the REAL `ContributorCollection` (not a hand-rolled stub) so
 * its actual auto-heal effect runs, wrapped only to record the `activeType`
 * prop the connector passes on every render — the direct behavioural
 * contract, independent of whether the test runner applies the React
 * Compiler (vitest here uses `unplugin-swc`, not `babel-plugin-react-compiler`
 * — see `vitest.config.mts` — so `handleActiveTypeChange`'s identity changes
 * every render and the child effect keeps retrying until it converges; the
 * production Vite build DOES apply the compiler, memoising that callback, so
 * the same defect leaves the page stuck on the empty state instead of
 * self-correcting).
 */
import { InMemoryCache } from '@apollo/client';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { render, waitFor } from '@testing-library/react';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

// ─── Spy on the real ContributorCollection ─────────────────────────────────
// Records every `activeType`/`counts.organizations` pair the connector passes
// it, then renders the REAL component (so its own auto-heal effect runs
// exactly as in production) — only the recording is test-only.
type RecordedRender = { activeType: string; organizations: number };
let recorded: RecordedRender[] = [];

vi.mock('@/crd/components/callout/ContributorCollection/ContributorCollection', async importOriginal => {
  const actual =
    await importOriginal<typeof import('@/crd/components/callout/ContributorCollection/ContributorCollection')>();
  return {
    ...actual,
    ContributorCollection: (props: Parameters<typeof actual.ContributorCollection>[0]) => {
      recorded.push({ activeType: props.activeType, organizations: props.counts.organizations });
      return <actual.ContributorCollection {...props} />;
    },
  };
});

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
              users: 0,
              organizations: 2,
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

const byTypeMock = (
  type: ActorType,
  items: ContributorItem[],
  delay: number
): MockedResponse<ContributorCollectionByTypeQuery> => ({
  request: { query: ContributorCollectionByTypeDocument, variables: { calloutId: CALLOUT_ID, type } },
  delay,
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
  recorded = [];
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

describe('ContributorCollectionConnector — auto-heal activeType sequence', () => {
  it('passes "organization" on the render immediately after counts resolve, never "user" again afterwards', async () => {
    const orgMock = byTypeMock(
      ActorType.Organization,
      [item('org-1', ActorType.Organization, 'Org One'), item('org-2', ActorType.Organization, 'Org Two')],
      30
    );
    const userMock = byTypeMock(ActorType.User, [], 0);

    render(
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <MockedProvider mocks={[configMock, userMock, orgMock]} cache={new InMemoryCache({ typePolicies })}>
            <ContributorCollectionConnector calloutId={CALLOUT_ID} />
          </MockedProvider>
        </I18nextProvider>
      </MemoryRouter>
    );

    // Wait until the collection has settled on 'organization' (it eventually
    // does in this test runner, since vitest does not apply the React
    // Compiler — see file header).
    await waitFor(() => expect(recorded[recorded.length - 1]?.activeType).toBe('organization'));

    // The render where counts first arrive (organizations: 2) is the one the
    // auto-heal must react to.
    const countsArrivedIndex = recorded.findIndex(r => r.organizations > 0);
    expect(countsArrivedIndex).toBeGreaterThanOrEqual(0);

    // Contract: the VERY NEXT render after counts arrive must already show
    // 'organization' — the connector's redundant default-type opener must not
    // get a chance to overwrite the child's heal with 'user' first.
    expect(recorded[countsArrivedIndex + 1]?.activeType).toBe('organization');

    // And once healed, it must never render 'user' again.
    expect(recorded.slice(countsArrivedIndex + 1).some(r => r.activeType === 'user')).toBe(false);
  });
});
