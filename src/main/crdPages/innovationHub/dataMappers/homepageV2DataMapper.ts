import { array, mixed, object, string } from 'yup';
import { type SpaceFilter, SpaceStatus, type V2HomepageQuery } from '@/core/apollo/generated-v2/graphql-schema';
import type { VirtualContributorCardItem } from '@/crd/components/common/profileTypes';
import type { InnovationHubHomeData } from '@/crd/components/innovationHub/InnovationHubHome';
import type { InnovationPackCardData } from '@/crd/components/innovationPack/types';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { buildMainDomainUrl, buildSettingsUrl, URL_SPACE_EXPLORER } from '@/main/routing/urlBuilders';

export type NativeHomepage = Extract<NonNullable<V2HomepageQuery['node']>, { kind: unknown }>;

export const homepageFromNode = (node: V2HomepageQuery['node']): NativeHomepage | undefined =>
  node && 'kind' in node && node.kind === 'HOMEPAGE' ? node : undefined;

// fed85 mapInnovationHubToHomeData.ts:34–61: live profile, edit affordance, and canonical explorer link.
export const mapHomepageHeader = (hub: NativeHomepage, canonicalDomain: string): InnovationHubHomeData => ({
  name: hub.about.displayName,
  tagline: hub.about.tagline ?? '',
  description: hub.about.description ?? '',
  bannerImageUrl: hub.about.banner?.file.url || undefined,
  bannerColor: pickColorFromId(hub.id),
  bannerAlt: hub.about.banner?.alt ?? hub.about.displayName,
  settingsUrl: hub.can.update && hub.url ? buildSettingsUrl(hub.url) : undefined,
  allSpacesUrl: buildMainDomainUrl(URL_SPACE_EXPLORER, canonicalDomain),
});

export const mapHomepagePacks = (hub: NativeHomepage): InnovationPackCardData[] =>
  (hub.curated ?? []).flatMap(({ node }) =>
    'kind' in node && node.kind === 'PACK'
      ? [
          {
            id: node.id,
            name: node.about.displayName,
            description: node.about.description ?? '',
            tags: node.tags,
            color: pickColorFromId(node.id),
            templateCount: node.templateCount ?? 0,
            url: node.url ?? undefined,
            providerName: node.host?.about?.displayName,
            providerAvatarUrl: node.host?.about?.avatar?.file.url,
            providerUrl: node.host?.url ?? undefined,
          },
        ]
      : []
  );

export const mapHomepageVirtualContributors = (hub: NativeHomepage, typeLabel: string): VirtualContributorCardItem[] =>
  (hub.curated ?? []).flatMap(({ node }) =>
    'actorType' in node
      ? [
          {
            id: node.id,
            displayName: node.about.displayName,
            description: node.about.tagline ?? null,
            type: typeLabel,
            href: node.url ?? undefined,
            avatarImageUrl: node.about.avatar?.file.url ?? null,
          },
        ]
      : []
  );

const hubSettings = object({
  hub: object({
    type: mixed<'list' | 'visibility'>().oneOf(['list', 'visibility']).required(),
    space_ids: array(string().required()).optional(),
    status_filter: array(
      mixed<SpaceStatus>()
        .oneOf([SpaceStatus.Active, SpaceStatus.Demo, SpaceStatus.Archived, SpaceStatus.Inactive])
        .required()
    ).optional(),
  })
    .optional()
    .default(undefined),
});

export type HomepageSpaceSelection = {
  filter: Pick<SpaceFilter, 'ids' | 'status'>;
  skip: boolean;
};

// fed85 hooks/useInnovationHubHomeData.ts:55–76: status selection is separate from hub listing visibility.
export const homepageSpaceSelection = (settings: unknown): HomepageSpaceSelection => {
  if (settings == null) return { filter: {}, skip: true };
  const { hub } = hubSettings.validateSync(settings, { strict: true });
  if (!hub) return { filter: {}, skip: true };
  if (hub.type === 'list') {
    const ids = hub.space_ids ?? [];
    return { filter: { ids }, skip: ids.length === 0 };
  }
  const status = hub.status_filter ?? [
    SpaceStatus.Active,
    SpaceStatus.Demo,
    SpaceStatus.Inactive,
    SpaceStatus.Archived,
  ];
  return { filter: { status }, skip: status.length === 0 };
};

// fed85 dataMappers/mapInnovationHubToHomeData.ts:91–115: configured order, absent nodes omitted.
export const orderHomepageSpaces = <T extends { id: string }>(
  selection: HomepageSpaceSelection,
  spaces: readonly T[]
): T[] => {
  if (selection.skip) return [];
  const ids = selection.filter.ids;
  if (!ids) return [...spaces];
  const byId = new Map(spaces.map(space => [space.id, space]));
  return ids.flatMap(id => {
    const space = byId.get(id);
    return space ? [space] : [];
  });
};
