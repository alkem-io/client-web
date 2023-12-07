import React, { ReactNode, useMemo, useState } from 'react';
import { LibraryTemplateCardProps } from './LibraryTemplateCard';
import filterFn, { ValueType } from '../../../../core/utils/filtering/filterFn';

import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { compact } from 'lodash';
import LibraryTemplatesView, { LibraryTemplatesFilter } from './LibraryTemplatesView';
import TemplatePreviewDialog, { TemplatePreview } from '../../../template/templatePreviewDialog/TemplatePreviewDialog';
import { useWhiteboardTemplateContentQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { TemplateType } from '../InnovationPackProfilePage/InnovationPackProfilePage';

interface DashboardLibraryTemplatesProps {
  headerTitle: ReactNode;
  dialogTitle: ReactNode;
  templates: LibraryTemplateCardProps[] | undefined;
}

const templatesValueGetter = (template: LibraryTemplateCardProps): ValueType => ({
  id: template.id,
  values: compact([
    template.profile.displayName,
    template.innovationPack?.profile.displayName,
    template.innovationPack?.provider?.profile.displayName,
    ...(template.profile.tagset?.tags ?? []),
  ]),
});

const MAX_TEMPLATES_WHEN_NOT_EXPANDED = 10;

const DashboardLibraryTemplates = ({ headerTitle, dialogTitle, templates }: DashboardLibraryTemplatesProps) => {
  const [filter, onFilterChange] = useState<LibraryTemplatesFilter>({
    templateTypes: [],
    searchTerms: [],
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<LibraryTemplateCardProps>();

  const { data: whiteboardTemplateContentData, loading: loadingWhiteboardTemplateContent } =
    useWhiteboardTemplateContentQuery({
      variables: {
        whiteboardTemplateId: selectedTemplate?.id!,
      },
      skip: !selectedTemplate || selectedTemplate.templateType !== TemplateType.WhiteboardTemplate,
    });

  const filteredLibraryTemplates = useMemo(() => {
    return filterFn(
      // Filter templates by type:
      (templates ?? []).filter(
        template => filter.templateTypes.length === 0 || filter.templateTypes.includes(template.templateType)
      ),
      // Filter by search terms:
      filter.searchTerms,
      templatesValueGetter
    );
  }, [templates, filter]);

  const templatePreview = useMemo(() => {
    if (!selectedTemplate) {
      return undefined;
    }
    const template =
      selectedTemplate.templateType !== TemplateType.WhiteboardTemplate
        ? selectedTemplate
        : {
            ...selectedTemplate,
            ...whiteboardTemplateContentData?.lookup?.whiteboardTemplate,
          };
    return {
      template,
      templateType: selectedTemplate?.templateType,
    } as TemplatePreview;
  }, [selectedTemplate, whiteboardTemplateContentData]);

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
      />
      <DialogWithGrid open={isDialogOpen} onClose={() => setIsDialogOpen(false)} columns={12}>
        <LibraryTemplatesView
          filter={filter}
          headerTitle={dialogTitle}
          templates={filteredLibraryTemplates}
          onFilterChange={onFilterChange}
          expanded={isDialogOpen}
          onDialogClose={() => setIsDialogOpen(false)}
          onClick={template => setSelectedTemplate(template)}
          sx={{ flexShrink: 1 }}
        />
      </DialogWithGrid>
      <TemplatePreviewDialog
        open={!!selectedTemplate}
        onClose={() => setSelectedTemplate(undefined)}
        templatePreview={templatePreview}
        innovationPack={selectedTemplate?.innovationPack}
        loadingTemplateContent={loadingWhiteboardTemplateContent}
      />
    </>
  );
};

export default DashboardLibraryTemplates;
