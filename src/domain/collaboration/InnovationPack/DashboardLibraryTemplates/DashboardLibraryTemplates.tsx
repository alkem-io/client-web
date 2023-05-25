import React, { ReactNode, useMemo, useState } from 'react';
import { LibraryTemplateCardProps } from './LibraryTemplateCard';
import { Identifiable } from '../../../shared/types/Identifiable';
import filterFn, { ValueType } from '../../../../common/components/core/card-filter/filterFn';

import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { useTranslation } from 'react-i18next';
import { compact } from 'lodash';
import LibraryTemplatesView, { LibraryTemplatesFilter } from './LibraryTemplatesView';
import TemplatePreviewDialog, { TemplatePreview } from '../TemplatePreviewDialog/TemplatePreviewDialog';
import { usePlatformWhiteboardTemplateValueQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { TemplateType } from '../InnovationPackProfilePage/InnovationPackProfilePage';

interface DashboardLibraryTemplatesProps {
  headerTitle: ReactNode;
  templates: (Identifiable & LibraryTemplateCardProps)[] | undefined;
}

const templatesValueGetter = (template: Identifiable & LibraryTemplateCardProps): ValueType => ({
  id: template.id,
  values: compact([
    template.displayName,
    template.innovationPack.displayName,
    template.provider.displayName,
    ...(template.tags ?? []),
  ]),
});

const MAX_TEMPLATES_WHEN_NOT_EXPANDED = 10;

const DashboardLibraryTemplates = ({ headerTitle, templates }: DashboardLibraryTemplatesProps) => {
  const [filter, onFilterChange] = useState<LibraryTemplatesFilter>({
    templateTypes: [],
    searchTerms: [],
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePreview | undefined>();

  const { data: whiteboardTemplateValueData, loading: loadingWhiteboardTemplateValue } =
    usePlatformWhiteboardTemplateValueQuery({
      variables: {
        innovationPackId: selectedTemplate?.template.innovationPack.id!,
        whiteboardTemplateId: selectedTemplate?.template.id!,
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

  const { t } = useTranslation();

  return (
    <>
      <LibraryTemplatesView
        filter={filter}
        headerTitle={headerTitle}
        templates={filteredLibraryTemplates.slice(0, MAX_TEMPLATES_WHEN_NOT_EXPANDED)}
        onFilterChange={onFilterChange}
        expanded={isDialogOpen}
        onDialogOpen={() => setIsDialogOpen(true)}
        onClick={card => {
          setSelectedTemplate({ template: card, templateType: card.templateType });
        }}
        hasMore={filteredLibraryTemplates.length > MAX_TEMPLATES_WHEN_NOT_EXPANDED}
      />
      <DialogWithGrid open={isDialogOpen} onClose={() => setIsDialogOpen(false)} columns={12}>
        <LibraryTemplatesView
          filter={filter}
          headerTitle={t('common.innovation-packs')}
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
        template={selectedTemplate}
        templateWithValue={whiteboardTemplateValueData?.platform.library.innovationPack?.templates?.whiteboardTemplate}
        loadingTemplateValue={loadingWhiteboardTemplateValue}
      />
    </>
  );
};

export default DashboardLibraryTemplates;
