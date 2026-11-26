import React, { type FC, type PropsWithChildren } from 'react';
import {
  type AuthorizationPrivilege,
  SpaceLevel,
  TagsetReservedName,
  TagsetType,
} from '@/core/apollo/generated/graphql-schema';
import type { SpaceDocumentFragment } from '@/core/apollo/generated-v2/graphql-schema';
import { facetLinks, facetPurpose } from '@/domain/space/about/aboutFacets';
import type { ContributorModel, SpaceAboutFullModel } from '@/domain/space/about/model/spaceAboutFull.model';
import { useSpacePageData } from '@/domain/space/hooks/useSpacePage';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { pageSpace, shellSpaceAbout } from './spacePageShellMapper';

interface SubspacePermissions {
  canUpdate: boolean;
  canCreate: boolean;
  canCreateSubspace: boolean;
  canRead: boolean;
  contextPrivileges: AuthorizationPrivilege[];
}

interface SubspaceContextProps {
  subspace: {
    id: string;
    nameId: string;
    level: SpaceLevel;
    about: SpaceAboutFullModel;
    authorization?: {
      myPrivileges: AuthorizationPrivilege[];
    };
  };
  loading: boolean;
  parentSpaceId: string | undefined;
  permissions: SubspacePermissions;
}

const defaultValue: SubspaceContextProps = {
  loading: true,
  subspace: {
    id: '',
    nameId: '',
    level: SpaceLevel.L1,
    about: {
      id: '',
      profile: {
        id: '',
        displayName: '',
        avatar: undefined,
        banner: undefined,
        cardBanner: undefined,
        tagline: '',
        url: '',
      },
      who: '',
      why: '',
      membership: {
        myMembershipStatus: undefined,
        roleSetID: '',
        communityID: undefined,
        leadUsers: [],
        leadOrganizations: [],
      },
      isContentPublic: true,
      guidelines: {
        id: '',
      },
      metrics: [],
    },
  },
  parentSpaceId: undefined,
  permissions: {
    canUpdate: false,
    canCreate: false,
    canCreateSubspace: false,
    canRead: false,
    contextPrivileges: [],
  },
};

export const SubspaceContext = React.createContext<SubspaceContextProps>(defaultValue);

interface SubspaceProviderProps extends PropsWithChildren {}

type Lead = NonNullable<SpaceDocumentFragment['leads']>[number];
type Location = { city?: string; country?: string } | null | undefined;
type FileRef = { alt?: string | null; file: { id: string; url: string } } | null | undefined;

const visual = (ref: FileRef) =>
  ref ? { id: ref.file.id, uri: ref.file.url, alternativeText: ref.alt ?? undefined } : undefined;

// A native actor face carries no profile or visual wrapper: both ids are the actor's own (wrapper-ids -> owner id).
const contributor = (actor: Lead): ContributorModel => ({
  id: actor.id,
  profile: actor.about
    ? {
        id: actor.id,
        displayName: actor.about.displayName,
        url: actor.url ?? '',
        avatar: actor.about.avatar ? { id: actor.id, uri: actor.about.avatar.file.url } : undefined,
        location: (actor.about.location as Location) ?? undefined,
      }
    : undefined,
});

/**
 * The subspace About from its D2 Space document (021 T004), the model's fields as legacy renders them: who/why and the
 * references from the About's facets (core.purpose, A4.1; the link roles' links); a field the space holds no value for
 * comes back null.
 */
export const subspaceAbout = (space: SpaceDocumentFragment): SpaceAboutFullModel => {
  const location = space.about.location as Location;
  const leads = space.leads ?? [];
  const purpose = facetPurpose(space.about.facets);
  return {
    id: space.id,
    who: purpose?.who ?? '',
    why: purpose?.why ?? '',
    isContentPublic: space.isContentPublic,
    provider: space.host ? contributor(space.host) : undefined,
    membership: {
      ...shellSpaceAbout(space).membership,
      leadUsers: leads.filter(lead => lead.actorType === 'user').map(contributor),
      leadOrganizations: leads.filter(lead => lead.actorType === 'organization').map(contributor),
    },
    guidelines: { id: space.id },
    metrics: space.memberCount == null ? [] : [{ name: 'members', value: String(space.memberCount) }],
    profile: {
      id: space.id,
      url: space.url ?? '',
      displayName: space.about.displayName,
      tagline: space.about.tagline ?? '',
      description: space.about.description ?? undefined,
      tagset: {
        id: space.id,
        name: TagsetReservedName.Default,
        tags: space.tags,
        allowedValues: [],
        type: TagsetType.Freeform,
      },
      avatar: visual(space.about.avatar),
      banner: visual(space.about.banner),
      cardBanner: visual(space.about.card),
      references: facetLinks(space.about.facets).map(link => ({
        id: link.id ?? link.uri,
        name: link.title ?? '',
        uri: link.uri,
        description: link.description ?? undefined,
      })),
      location: location ? { id: space.id, city: location.city, country: location.country } : undefined,
    },
  };
};

const SubspaceContextProvider: FC<SubspaceProviderProps> = ({ children }) => {
  const { spaceId, loading: urlResolverLoading, parentSpaceId } = useUrlResolver();
  // The page's own D2 Space document (021 FR-003): CrdSubspacePageLayout loads it, this provider only reads the cache.
  const data = useSpacePageData(spaceId, 'space');
  const space = pageSpace(data?.node, spaceId);

  // don't provide space L0 as subspace
  if (space?.depth === 0) return <SubspaceContext value={defaultValue}>{children}</SubspaceContext>;

  const state: SubspaceContextProps = {
    subspace: space
      ? {
          id: space.id,
          nameId: space.handle,
          level: space.depth === 1 ? SpaceLevel.L1 : SpaceLevel.L2,
          about: subspaceAbout(space),
        }
      : defaultValue.subspace,
    parentSpaceId,
    permissions: {
      canUpdate: space?.can.update ?? false,
      canCreate: space?.can.createPost ?? false,
      canCreateSubspace: space?.can.createSubspace ?? false,
      canRead: space?.can.read ?? false,
      contextPrivileges: [],
    },
    loading: urlResolverLoading || (Boolean(spaceId) && !data),
  };

  return <SubspaceContext value={state}>{children}</SubspaceContext>;
};

export default SubspaceContextProvider;
