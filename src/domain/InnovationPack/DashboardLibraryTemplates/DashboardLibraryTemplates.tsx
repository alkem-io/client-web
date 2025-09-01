import { ReactNode, useMemo, useState } from 'react';
import filterFn, { ValueType } from '@/core/utils/filtering/filterFn';
import { compact } from 'lodash';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import PreviewTemplateDialog from '@/domain/templates/components/Dialogs/PreviewTemplateDialog/PreviewTemplateDialog';
import LibraryTemplatesView, { LibraryTemplatesFilter } from './LibraryTemplatesView';
import { AnyTemplate, AnyTemplateWithInnovationPack } from '@/domain/templates/models/TemplateBase';

type DashboardLibraryTemplatesProps = {
  headerTitle: ReactNode;
  dialogTitle: ReactNode;
  templates: AnyTemplateWithInnovationPack[] | undefined;
  loading?: boolean;
};

const templatesValueGetter = (template: AnyTemplateWithInnovationPack): ValueType => ({
  id: template.template.id,
  values: compact([
    template.template.profile.displayName,
    template.innovationPack?.profile.displayName,
    template.innovationPack?.provider?.profile.displayName,
    ...(template.template.profile.defaultTagset?.tags ?? []),
  ]),
});

const MAX_TEMPLATES_WHEN_NOT_EXPANDED = 10;

const DashboardLibraryTemplates = ({
  loading,
  templates,
  headerTitle,
  dialogTitle,
}: DashboardLibraryTemplatesProps) => {
  const [filter, onFilterChange] = useState<LibraryTemplatesFilter>({
    templateTypes: [],
    searchTerms: [],
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AnyTemplate>();

  const filteredLibraryTemplates = useMemo(() => {
    const templatesWithIds =
      templates?.map(template => ({
        id: template.template.id,
        ...template,
      })) ?? [];

    return filterFn(
      // Filter templates by type:
      templatesWithIds.filter(
        template => filter.templateTypes.length === 0 || filter.templateTypes.includes(template.template.type)
      ),
      // Filter by search terms:
      filter.searchTerms,
      templatesValueGetter
    );
  }, [templates, filter]);

  return (
    <>
      <LibraryTemplatesView
        filter={filter}
        headerTitle={headerTitle}
        templates={filteredLibraryTemplates.slice(0, MAX_TEMPLATES_WHEN_NOT_EXPANDED)}
        onFilterChange={onFilterChange}
        expanded={isDialogOpen}
        onDialogOpen={() => setIsDialogOpen(true)}
        onClick={template => {
          setSelectedTemplate(template);
        }}
        hasMore={filteredLibraryTemplates.length > MAX_TEMPLATES_WHEN_NOT_EXPANDED}
        loading={loading}
      />
      <DialogWithGrid
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        columns={12}
        aria-labelledby="library-templates-dialog-title"
      >
        <LibraryTemplatesView
          filter={filter}
          headerTitle={dialogTitle}
          templates={filteredLibraryTemplates}
          onFilterChange={onFilterChange}
          expanded={isDialogOpen}
          onDialogClose={() => setIsDialogOpen(false)}
          onClick={template => setSelectedTemplate(template)}
          sx={{ flexShrink: 1 }}
          loading={loading}
          headerTitleId="library-templates-dialog-title"
        />
      </DialogWithGrid>
      {selectedTemplate && (
        <PreviewTemplateDialog open template={selectedTemplate} onClose={() => setSelectedTemplate(undefined)} />
      )}
    </>
  );
};

export default DashboardLibraryTemplates;
