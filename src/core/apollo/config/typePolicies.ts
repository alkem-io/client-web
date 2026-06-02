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
      templatesPaginated: paginationFieldPolicy(['filter'], 'TemplateResult'),
      innovationPacksPaginated: paginationFieldPolicy(false, 'InnovationPack'),
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
