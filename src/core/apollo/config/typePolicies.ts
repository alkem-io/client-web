import type { TypedTypePolicies } from '../generated/apollo-helpers';
import { paginationFieldPolicy } from './paginationPolicy';

export const typePolicies: TypedTypePolicies = {
  VcInteraction: {
    keyFields: ['threadID', 'virtualContributorID'],
  },
  LookupQueryResults: {
    merge: true,
  },
  Platform: {
    merge: true,
  },
  Library: {
    fields: {
      // `keyArgs: ['filter']` keeps an independently-paged cached list per type filter,
      // so changing the template-type filter naturally serves a fresh first page (FR-007).
      // `TemplateResult` is a non-normalized wrapper (no own id) — the relay merge's
      // id-dedup is a no-op; continuity relies on the server's stable rowId-DESC cursors.
      // Accepted risk (no page-seam dedup); see research.md Decision 6 for the rationale
      // and the remediation path if the server ever returns overlapping pages.
      templatesPaginated: paginationFieldPolicy(['filter'], 'TemplateResult'),
      // Packs now take a `filter` (searchTerm); key on it so a search re-keys to a fresh first page (FR-017).
      innovationPacksPaginated: paginationFieldPolicy(['filter'], 'InnovationPack'),
    },
  },
  MeQueryResults: {
    merge: true,
  },
  Space: {
    fields: {
      activeSubscription: {
        merge: true,
      },
    },
  },
  SpaceAbout: {
    fields: {
      membership: {
        merge: true,
      },
    },
  },
  UserGroup: {
    fields: {
      members: {
        merge: false,
      },
    },
  },
  Config: {
    merge: true,
  },
  Metadata: {
    merge: true,
  },
  RoleSet: {
    fields: {
      availableUsersForElevatedRole: paginationFieldPolicy(['role', 'filter'], 'User'),
      availableUsersForEntryRole: paginationFieldPolicy(['role', 'filter'], 'User'),
      availableVirtualContributorsForEntryRole: paginationFieldPolicy(['role', 'filter'], 'VirtualContributor'),
    },
  },
  Post: {
    fields: {},
  },
  Message: {
    fields: {
      reactions: {
        merge: false,
      },
    },
  },
  CalloutSettings: {
    merge: true,
  },
  // Non-normalized (no id). The feed-list `Callout` fragment and the full
  // `CalloutDetails` query both write `Callout.settings.contribution`; without a
  // merge here a partial list write can replace the object and drop `enabled` /
  // `canAddContributions`, which silently hides the "Add contribution" affordance.
  CalloutSettingsContribution: {
    merge: true,
  },
  WhiteboardPreviewSettings: {
    merge: true,
  },
  // Disable all keyFields for UrlResolver queries *See UrlResolverProvider.tsx to understand why
  UrlResolverQueryResults: {
    keyFields: false,
  },
  UrlResolverQueryResultInnovationPack: {
    keyFields: false,
  },
  UrlResolverQueryResultSpace: {
    keyFields: false,
  },
  UrlResolverQueryResultTemplatesSet: {
    keyFields: false,
  },
  UrlResolverQueryResultCollaboration: {
    keyFields: false,
  },
  UrlResolverQueryResultCalendar: {
    keyFields: false,
  },
  UrlResolverQueryResultCalloutsSet: {
    keyFields: false,
  },
  UrlResolverQueryResultVirtualContributor: {
    keyFields: false,
  },
  Query: {
    fields: {
      usersPaginated: paginationFieldPolicy(['filter'], 'User'),
      organizationsPaginated: paginationFieldPolicy(['filter'], 'Organization'),
      spacesPaginated: paginationFieldPolicy(['filter'], 'Space'),
      activityFeed: paginationFieldPolicy(['args'], 'ActivityLogEntry'),
      // Store UrlResolver queries in the cache using the url passed as parameter as the key
      urlResolver: {
        keyArgs: false,
        merge(existing = {}, incoming, { args }) {
          const url = args?.url;
          if (!url) {
            return existing;
          }
          return {
            ...existing,
            [url]: incoming,
          };
        },
        read(existing, { args }) {
          const url = args?.url;
          if (!url) {
            return undefined;
          }
          return existing ? existing[url] : undefined;
        },
      },
    },
  },
  PlatformAdminQueryResults: {
    merge: true,
    fields: {
      users: paginationFieldPolicy(['filter'], 'User'),
      organizations: paginationFieldPolicy(['filter'], 'Organization'),
      spaces: paginationFieldPolicy(['filter'], 'Space'),
    },
  },
};
