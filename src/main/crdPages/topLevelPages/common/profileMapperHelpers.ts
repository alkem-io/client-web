import type {
  ReferenceLink,
  SimpleResourceCardItem,
  TagsetGroup,
  VirtualContributorCardItem,
} from '@/crd/components/common/profileTypes';

export type RawReference = {
  id: string;
  name: string;
  uri: string;
  description?: string | null;
};

export const normaliseReferences = (references: RawReference[]): ReferenceLink[] =>
  references.map(ref => ({
    id: ref.id,
    name: ref.name,
    uri: ref.uri,
    description: ref.description ?? null,
  }));

export const buildTagsetGroups = (groups: Array<{ key: string; name: string; tags: string[] }>): TagsetGroup[] =>
  groups.filter(g => g.tags.length > 0);

type AccountResourceProfileLike =
  | {
      id?: string | null;
      displayName: string;
      url: string;
      tagline?: string | null;
      avatar?: { uri: string } | null;
    }
  | null
  | undefined;

export type AccountResourcesShape =
  | {
      virtualContributors?: Array<{ id: string; profile?: AccountResourceProfileLike }>;
      innovationPacks?: Array<{ id: string; profile?: AccountResourceProfileLike }>;
      innovationHubs?: Array<{ id: string; profile?: AccountResourceProfileLike; nameID?: string }>;
    }
  | null
  | undefined;

export type AccountHostedResources = {
  hostedVirtualContributors: VirtualContributorCardItem[];
  hostedInnovationPacks: SimpleResourceCardItem[];
  hostedInnovationHubs: SimpleResourceCardItem[];
};

const toSimpleResourceCard = (item: {
  id: string;
  profile?: AccountResourceProfileLike;
}): SimpleResourceCardItem | null => {
  if (!item.profile) return null;
  return {
    id: item.id,
    displayName: item.profile.displayName,
    description: item.profile.tagline ?? null,
    href: item.profile.url,
    avatarImageUrl: item.profile.avatar?.uri ?? null,
  };
};

/**
 * Shared mapper for the User and Organization profile "Other Resources" tab.
 * The `hostedResources` payload shape is identical for user and organization
 * accounts, so the three sub-section arrays (Virtual Contributors, Template
 * Packs, Custom Homepages) are produced from one helper. The server has already
 * applied the viewer's visibility — no filtering here. Hosted Spaces are deliberately
 * not shown — the Leading / Member of tabs cover a profile's Spaces.
 */
export const mapAccountHostedResources = (input: AccountResourcesShape, vcType: string): AccountHostedResources => {
  const hostedVirtualContributors: VirtualContributorCardItem[] = (input?.virtualContributors ?? []).flatMap(v => {
    const profile = v.profile;
    if (!profile) return [];
    return [
      {
        id: v.id,
        displayName: profile.displayName,
        description: profile.tagline ?? null,
        type: vcType,
        href: profile.url,
        avatarImageUrl: profile.avatar?.uri ?? null,
      },
    ];
  });

  const hostedInnovationPacks = (input?.innovationPacks ?? [])
    .map(toSimpleResourceCard)
    .filter((card): card is SimpleResourceCardItem => card !== null);

  const hostedInnovationHubs = (input?.innovationHubs ?? [])
    .map(hub => {
      const card = toSimpleResourceCard(hub);
      if (!card) return null;
      // Override the server-provided `profile.url` (legacy `/innovation-hub/<slug>`)
      // with the canonical CRD `/hub/<nameID>` path. Falls back to the profile
      // url when no nameID is available (defensive — every hub has one).
      return hub.nameID ? { ...card, href: `/hub/${hub.nameID}` } : card;
    })
    .filter((card): card is SimpleResourceCardItem => card !== null);

  return { hostedVirtualContributors, hostedInnovationPacks, hostedInnovationHubs };
};
