import { useTranslation } from 'react-i18next';
import ScrollableCardsLayoutContainer from '@/core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import { Caption } from '@/core/ui/typography';
import GridProvider from '@/core/ui/grid/GridProvider';
import { AnyTemplate, AnyTemplateWithInnovationPack } from '@/domain/templates/models/TemplateBase';
import TemplateCard from '@/domain/templates/components/cards/TemplateCard';
import ContributeCardSkeleton from '@/core/ui/card/ContributeCardSkeleton';
import { times } from 'lodash';
import SearchField from '@/core/ui/search/SearchField';
import React, { useMemo, useState } from 'react';
import Gutters from '@/core/ui/grid/Gutters';

export interface ImportTemplatesDialogGalleryProps {
  templates: AnyTemplateWithInnovationPack[] | undefined;
  onClickTemplate: (template: AnyTemplate) => void;
  loading?: boolean;
  children?: React.ReactNode;
}

const ImportTemplatesDialogGallery = ({
  children,
  templates = [],
  onClickTemplate,
  loading,
}: ImportTemplatesDialogGalleryProps) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>('');

  const filterTemplatesCallback = (template: AnyTemplateWithInnovationPack) => {
    const lowerCaseFilter = filter.toLowerCase();

    return template?.template?.profile?.displayName.toLowerCase().includes(lowerCaseFilter);
  };

  const filteredTemplates = useMemo(
    () => (templates.length && filter.length > 0 ? templates?.filter(filterTemplatesCallback) : templates),
    [templates, filter]
  );

  const hasTemplates = templates.length > 0;
  const showHeader = hasTemplates || Boolean(children);

  return (
    <GridProvider columns={12}>
      {showHeader && (
        <Gutters sx={{ paddingX: 0, paddingTop: 0 }} alignItems={'center'} flexDirection={{ xs: 'column', sm: 'row' }}>
          <Gutters disablePadding disableGap flex={'1'}>
            {children}
          </Gutters>
          {hasTemplates && (
            <SearchField
              sx={{ maxWidth: '248px' }}
              value={filter}
              onChange={event => setFilter(event.target.value)}
              placeholder={t('common.search')}
            />
          )}
        </Gutters>
      )}
      {(hasTemplates || loading) && (
        <ScrollableCardsLayoutContainer>
          {loading ? times(5, i => <ContributeCardSkeleton key={i} />) : null}
          {filteredTemplates.map(({ template, innovationPack }) => (
            <TemplateCard
              key={template.id}
              template={template}
              innovationPack={innovationPack}
              onClick={() => onClickTemplate(template)}
            />
          ))}
        </ScrollableCardsLayoutContainer>
      )}
      {!loading && !hasTemplates && <Caption>{t('pages.admin.generic.sections.templates.import.noTemplates')}</Caption>}
    </GridProvider>
  );
};

export default ImportTemplatesDialogGallery;
