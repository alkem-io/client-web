import {
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  FileText,
  LayoutTemplate,
  MoreHorizontal,
  Pencil,
  PenTool,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/crd/primitives/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';
import { Input } from '@/crd/primitives/input';
import { Separator } from '@/crd/primitives/separator';

export type TemplateCategory = 'space' | 'collaborationTool' | 'whiteboard' | 'post' | 'communityGuidelines';

export type TemplateTile = {
  id: string;
  category: TemplateCategory;
  name: string;
  description: string;
  thumbnailUrl: string | null;
  isCustom: boolean;
};

export type TemplateAction = 'preview' | 'duplicate' | 'edit' | 'delete';

export type TemplateCategorySection = {
  category: TemplateCategory;
  templates: TemplateTile[];
};

export type SpaceSettingsTemplatesViewProps = {
  categories: TemplateCategorySection[];
  loading?: boolean;
  onCreateTemplate: (c: TemplateCategory) => void;
  onImportTemplate: (c: TemplateCategory) => void;
  onTemplateAction: (id: string, action: TemplateAction) => void;
  className?: string;
};

type SectionMeta = {
  category: TemplateCategory;
  title: string;
  description: string;
  icon: React.ElementType;
};

const SECTIONS: SectionMeta[] = [
  {
    category: 'space',
    title: 'Space Templates',
    description: 'Structure your space with predefined layouts and tools.',
    icon: LayoutTemplate,
  },
  {
    category: 'collaborationTool',
    title: 'Collaboration Tool Templates',
    description: 'Tools for workshops, brainstorming, and group activities.',
    icon: Users,
  },
  {
    category: 'whiteboard',
    title: 'Whiteboard Templates',
    description: 'Canvas layouts for visual collaboration.',
    icon: PenTool,
  },
  {
    category: 'post',
    title: 'Post Templates',
    description: 'Standardized documents for projects and decisions.',
    icon: FileText,
  },
  {
    category: 'communityGuidelines',
    title: 'Community Guidelines Templates',
    description: 'Rules and expectations for your community.',
    icon: Users,
  },
];

export function SpaceSettingsTemplatesView({
  categories,
  loading: _loading,
  onCreateTemplate,
  onImportTemplate,
  onTemplateAction,
  className,
}: SpaceSettingsTemplatesViewProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    SECTIONS.forEach(s => {
      init[s.category] = true;
    });
    return init;
  });

  const toggleSection = (cat: string) => {
    setOpenSections(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const getTemplates = (cat: TemplateCategory) => {
    const section = categories.find(c => c.category === cat);
    const templates = section?.templates ?? [];
    if (!searchQuery) return templates;
    return templates.filter(
      t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('templates.pageHeader.title', { defaultValue: 'Templates' })}
        </h2>
        <p className="text-muted-foreground mt-2">
          {t('templates.pageHeader.subtitle', {
            defaultValue: 'Select and manage the templates available to your space members.',
          })}
        </p>
      </div>

      <Separator />

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder={t('templates.search', { defaultValue: 'Search templates...' })}
            className="pl-9"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Template Sections */}
      <div className="space-y-6">
        {SECTIONS.map(section => {
          const templates = getTemplates(section.category);
          const allTemplates = categories.find(c => c.category === section.category)?.templates ?? [];
          const isOpen = openSections[section.category] ?? true;
          const SectionIcon = section.icon;

          return (
            <Collapsible
              key={section.category}
              open={isOpen}
              onOpenChange={() => toggleSection(section.category)}
              className="bg-card border rounded-lg overflow-hidden"
            >
              <div className="p-4 flex items-center justify-between bg-muted/20">
                <CollapsibleTrigger asChild={true}>
                  <div className="flex items-center gap-3 cursor-pointer select-none group">
                    <div className="p-2 bg-background border rounded-md group-hover:bg-accent transition-colors">
                      <SectionIcon className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base">
                          {t(`templates.categories.${section.category}`, { defaultValue: section.title })}
                        </h3>
                        <Badge variant="secondary" className="text-xs h-5 px-1.5 min-w-[1.5rem] flex justify-center">
                          {allTemplates.length}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground hidden sm:block">{section.description}</p>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="size-4 text-muted-foreground ml-2" />
                    ) : (
                      <ChevronRight className="size-4 text-muted-foreground ml-2" />
                    )}
                  </div>
                </CollapsibleTrigger>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild={true}>
                    <Button size="sm" variant="outline" className="gap-2 hidden sm:flex">
                      <Plus className="size-4" />
                      {t('templates.addNew', { defaultValue: 'Add New' })}
                      <ChevronDown className="size-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => onCreateTemplate(section.category)}>
                      <Plus className="size-4 mr-2" />
                      {t('templates.createNew', { defaultValue: 'Create a new template' })}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onImportTemplate(section.category)}>
                      <LayoutTemplate className="size-4 mr-2" />
                      {t('templates.selectFromLibrary', {
                        defaultValue: 'Select a template from the platform library',
                      })}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile add button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild={true}>
                    <Button size="icon" variant="outline" className="sm:hidden h-8 w-8">
                      <Plus className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => onCreateTemplate(section.category)}>
                      <Plus className="size-4 mr-2" />
                      {t('templates.createNew', { defaultValue: 'Create a new template' })}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onImportTemplate(section.category)}>
                      <LayoutTemplate className="size-4 mr-2" />
                      {t('templates.selectFromLibrary', {
                        defaultValue: 'Select a template from the platform library',
                      })}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CollapsibleContent>
                <div className="p-4 border-t">
                  {templates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                      <SectionIcon className="size-10 mb-3 opacity-20" />
                      <p className="font-medium">
                        {t('templates.noTemplates', { defaultValue: 'No templates found' })}
                      </p>
                      <p className="text-sm">
                        {t('templates.noTemplatesHint', {
                          defaultValue: 'Try searching for a different term or create a new template.',
                        })}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {templates.map(tmpl => (
                        <TemplateCard key={tmpl.id} template={tmpl} onAction={onTemplateAction} />
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  onAction,
}: {
  template: TemplateTile;
  onAction: (id: string, action: TemplateAction) => void;
}) {
  const { t } = useTranslation('crd-spaceSettings');

  return (
    <div className="group relative flex flex-col border rounded-lg overflow-hidden bg-card hover:shadow-md transition-all duration-200">
      <div className="relative aspect-video bg-muted overflow-hidden">
        {template.thumbnailUrl ? (
          <img
            src={template.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
            {t('templates.noPreview', { defaultValue: 'No preview' })}
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          {template.isCustom && (
            <Badge variant="default" className="bg-primary shadow-sm">
              {t('templates.custom', { defaultValue: 'Custom' })}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-3">
        <div>
          <h4 className="font-semibold leading-none mb-1.5">{template.name}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
        </div>

        <div className="mt-auto flex items-center justify-end pt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild={true}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={t('templates.actions', { defaultValue: 'Template actions' })}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAction(template.id, 'preview')}>
                <Eye className="size-4 mr-2" />
                {t('templates.kebab.preview', { defaultValue: 'Preview' })}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction(template.id, 'duplicate')}>
                <Copy className="size-4 mr-2" />
                {t('templates.kebab.duplicate', { defaultValue: 'Duplicate as Custom' })}
              </DropdownMenuItem>
              {template.isCustom && (
                <>
                  <DropdownMenuItem onClick={() => onAction(template.id, 'edit')}>
                    <Pencil className="size-4 mr-2" />
                    {t('templates.kebab.edit', { defaultValue: 'Edit' })}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onAction(template.id, 'delete')}
                  >
                    <Trash2 className="size-4 mr-2" />
                    {t('templates.kebab.delete', { defaultValue: 'Delete' })}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
