import { useTranslation } from 'react-i18next';
import ScrollableCardsLayoutContainer from '@/core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import { Caption } from '@/core/ui/typography';
import GridProvider from '@/core/ui/grid/GridProvider';
import { AnyTemplate, AnyTemplateWithInnovationPack } from '@/domain/templates/models/TemplateBase';
import TemplateCard from '@/domain/templates/components/cards/TemplateCard';
import ContributeCardSkeleton from '@/core/ui/card/ContributeCardSkeleton';
import { times } from 'lodash';
import { gutters } from '@/core/ui/grid/utils';

export interface ImportTemplatesDialogGalleryProps {
  templates: AnyTemplateWithInnovationPack[] | undefined;
  onClickTemplate: (template: AnyTemplate) => void;
  loading?: boolean;
}

const ImportTemplatesDialogGallery = ({
  templates = [],
  onClickTemplate,
  loading,
}: ImportTemplatesDialogGalleryProps) => {
  const { t } = useTranslation();
  // TODO: Pending Implement filters sorting and pagination
  // const organizationFilter = null;
  // const innovationPackFilter = null;
  /*
  // TODO: Pending Implement filters
      <Grid item xs={12}>
        <input type="text" placeholder="search" />
      </Grid>
      <Grid item xs={12} md={3}>
        Filters
      </Grid>
      <Grid item xs={12} md={9}>
*/

  return (
    <GridProvider columns={12}>
      <ScrollableCardsLayoutContainer>
        {loading ? times(5, i => <ContributeCardSkeleton key={i} />) : null}
        {templates.map(({ template, innovationPack }) => (
          <TemplateCard
            key={template.id}
            template={template}
            innovationPack={innovationPack}
            onClick={() => onClickTemplate(template)}
          />
        ))}
      </ScrollableCardsLayoutContainer>
      {!loading && templates.length === 0 && (
        <Caption marginY={gutters()}>{t('pages.admin.generic.sections.templates.import.noTemplates')}</Caption>
      )}
    </GridProvider>
  );
};

export default ImportTemplatesDialogGallery;
