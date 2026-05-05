import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import type {
  TemplateCategory,
  TemplateCategorySection,
  TemplateTile,
} from '@/crd/components/space/settings/SpaceSettingsTemplatesView';

type TemplateFragment = {
  id: string;
  type: TemplateType;
  profile: {
    displayName: string;
    description?: string | null;
    visual?: { uri: string } | null;
  };
};

export function mapTemplatesToCategories(
  calloutTemplates: TemplateFragment[],
  postTemplates: TemplateFragment[],
  whiteboardTemplates: TemplateFragment[],
  communityGuidelinesTemplates: TemplateFragment[],
  spaceTemplates: TemplateFragment[]
): TemplateCategorySection[] {
  return [
    { category: 'space', templates: spaceTemplates.map(t => mapTemplate(t, 'space')) },
    { category: 'collaborationTool', templates: calloutTemplates.map(t => mapTemplate(t, 'collaborationTool')) },
    { category: 'whiteboard', templates: whiteboardTemplates.map(t => mapTemplate(t, 'whiteboard')) },
    { category: 'post', templates: postTemplates.map(t => mapTemplate(t, 'post')) },
    {
      category: 'communityGuidelines',
      templates: communityGuidelinesTemplates.map(t => mapTemplate(t, 'communityGuidelines')),
    },
  ];
}

function mapTemplate(t: TemplateFragment, category: TemplateCategory): TemplateTile {
  return {
    id: t.id,
    category,
    name: t.profile.displayName,
    description: t.profile.description ?? '',
    thumbnailUrl: t.profile.visual?.uri ?? null,
    isCustom: true,
  };
}

export function categoryToTemplateType(category: TemplateCategory): TemplateType {
  switch (category) {
    case 'space':
      return TemplateType.Space;
    case 'collaborationTool':
      return TemplateType.Callout;
    case 'whiteboard':
      return TemplateType.Whiteboard;
    case 'post':
      return TemplateType.Post;
    case 'communityGuidelines':
      return TemplateType.CommunityGuidelines;
  }
}
