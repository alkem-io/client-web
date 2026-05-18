import { TemplateType as GqlTemplateType } from '@/core/apollo/generated/graphql-schema';
import type { TemplateCardData, TemplateType } from '@/crd/components/templates/types';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';

/** Minimal GraphQL `Template` shape this mapper relies on (a subset of the generated `Template` type). */
export type GqlTemplateLike = {
  id: string;
  type: GqlTemplateType;
  profile: {
    displayName: string;
    description?: string | null;
    url?: string | null;
    visual?: { uri: string } | null;
    cardBanner?: { uri: string } | null;
    defaultTagset?: { tags?: string[] | null } | null;
    tagset?: { tags?: string[] | null } | null;
  };
};

/** GraphQL `TemplateType` enum → the CRD string union. */
export function mapGqlTemplateType(gql: GqlTemplateType): TemplateType {
  switch (gql) {
    case GqlTemplateType.Space:
      return 'space';
    case GqlTemplateType.Callout:
      return 'callout';
    case GqlTemplateType.Whiteboard:
      return 'whiteboard';
    case GqlTemplateType.Post:
      return 'post';
    case GqlTemplateType.CommunityGuidelines:
      return 'communityGuidelines';
    default:
      // Should be exhaustive; fall back to 'callout' for unknown future enum members.
      return 'callout';
  }
}

/** CRD string union → GraphQL `TemplateType` enum. */
export function toGqlTemplateType(type: TemplateType): GqlTemplateType {
  switch (type) {
    case 'space':
      return GqlTemplateType.Space;
    case 'callout':
      return GqlTemplateType.Callout;
    case 'whiteboard':
      return GqlTemplateType.Whiteboard;
    case 'post':
      return GqlTemplateType.Post;
    case 'communityGuidelines':
      return GqlTemplateType.CommunityGuidelines;
  }
}

/**
 * GraphQL `Template` → `TemplateCardData`.
 * - `bannerUrl` left undefined when there is no real visual ⇒ the component renders the `color` gradient.
 * - `ownerLabel` undefined here; library/account callers set it themselves.
 */
export function mapTemplateToCardData(template: GqlTemplateLike, ownerLabel?: string): TemplateCardData {
  const tags = template.profile.defaultTagset?.tags ?? template.profile.tagset?.tags ?? [];
  return {
    id: template.id,
    type: mapGqlTemplateType(template.type),
    name: template.profile.displayName,
    description: template.profile.description ?? '',
    tags: tags.filter((t): t is string => typeof t === 'string'),
    bannerUrl: template.profile.visual?.uri || template.profile.cardBanner?.uri || undefined,
    color: pickColorFromId(template.id),
    url: template.profile.url ?? undefined,
    ownerLabel,
  };
}
