export type TemplateCategory = 'post' | 'whiteboard' | 'callout' | 'space';

export type TemplateTile = {
  id: string;
  category: TemplateCategory;
  name: string;
  description: string;
};

export type TemplatesViewProps = {
  templates: TemplateTile[];
  onCreate: (category: TemplateCategory) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};
