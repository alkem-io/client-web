export type TemplateCategory =
  | 'space'
  | 'collaborationTool'
  | 'whiteboard'
  | 'post'
  | 'communityGuidelines';

export type TemplateTile = {
  id: string;
  category: TemplateCategory;
  name: string;
  description: string;
  thumbnailUrl: string | null;
  isCustom: boolean;
};

export type TemplateCategorySection<C extends TemplateCategory = TemplateCategory> = {
  category: C;
  templates: TemplateTile[];
  collapsed: boolean;
};

export type TemplateAction = 'preview' | 'duplicate' | 'edit' | 'delete';

export type TemplatesViewProps = {
  /** Five entries in declared order: space, collaborationTool, whiteboard, post, communityGuidelines. */
  categories: [
    TemplateCategorySection<'space'>,
    TemplateCategorySection<'collaborationTool'>,
    TemplateCategorySection<'whiteboard'>,
    TemplateCategorySection<'post'>,
    TemplateCategorySection<'communityGuidelines'>
  ];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleCategory: (c: TemplateCategory) => void;
  onCreateTemplate: (c: TemplateCategory) => void;
  onSelectFromLibrary: (c: TemplateCategory) => void;
  onTemplateAction: (id: string, action: TemplateAction) => void;
};
