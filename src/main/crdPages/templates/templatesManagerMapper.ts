import type { TemplateCategorySection } from '@/crd/components/templates/types';
import { TEMPLATE_TYPE_ORDER } from '@/crd/components/templates/types';
import { type GqlTemplateLike, mapTemplateToCardData } from './templateCardMapper';

/** Minimal GraphQL `TemplatesSet` shape this mapper relies on. */
export type GqlTemplatesSetLike = {
  spaceTemplates?: GqlTemplateLike[] | null;
  calloutTemplates?: GqlTemplateLike[] | null;
  whiteboardTemplates?: GqlTemplateLike[] | null;
  postTemplates?: GqlTemplateLike[] | null;
  communityGuidelinesTemplates?: GqlTemplateLike[] | null;
};

/** GraphQL `TemplatesSet` → ordered category sections (one per type, in `TEMPLATE_TYPE_ORDER`). */
export function mapTemplatesSetToCategories(
  templatesSet: GqlTemplatesSetLike | null | undefined
): TemplateCategorySection[] {
  const byType = {
    space: templatesSet?.spaceTemplates ?? [],
    callout: templatesSet?.calloutTemplates ?? [],
    whiteboard: templatesSet?.whiteboardTemplates ?? [],
    post: templatesSet?.postTemplates ?? [],
    communityGuidelines: templatesSet?.communityGuidelinesTemplates ?? [],
  } as const;

  return TEMPLATE_TYPE_ORDER.map(type => ({
    type,
    templates: (byType[type] ?? []).map(t => mapTemplateToCardData(t)),
  }));
}

/** Flatten a list of GraphQL templates (one source) to cards, attaching an owner label. */
export function mapTemplatesToCards(templates: GqlTemplateLike[], ownerLabel?: string) {
  return templates.map(t => mapTemplateToCardData(t, ownerLabel));
}
