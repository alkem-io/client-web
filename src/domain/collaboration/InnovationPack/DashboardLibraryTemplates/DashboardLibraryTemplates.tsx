import React, { ReactNode, useMemo, useState } from 'react';
import { LibraryTemplateCardProps } from './LibraryTemplateCard';
import { Identifiable } from '../../../shared/types/Identifiable';
import filterFn, { ValueType } from '../../../../common/components/core/card-filter/filterFn';

import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { useTranslation } from 'react-i18next';
import { compact } from 'lodash';
import LibraryTemplatesView, { LibraryTemplatesFilter } from './LibraryTemplatesView';

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
          sx={{ flexShrink: 1 }}
        />
      </DialogWithGrid>
    </>
  );
};

export default DashboardLibraryTemplates;
