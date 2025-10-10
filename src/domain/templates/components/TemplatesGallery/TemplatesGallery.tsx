import { PropsWithChildren, ReactNode } from 'react';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import ScrollableCardsLayoutContainer from '@/core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import TemplateCard from '../cards/TemplateCard';
import { AnyTemplate } from '@/domain/templates/models/TemplateBase';
import ContributeCardSkeleton from '@/core/ui/card/ContributeCardSkeleton';
import { times } from 'lodash';

type TemplatesGalleryProps = {
  headerText: string;
  headerId?: string;
  actions?: ReactNode;

  // Provided by the container
  templates: AnyTemplate[] | undefined;
  loading?: boolean;
  buildTemplateLink: (template: AnyTemplate) => { to?: string; onClick?: () => void } | undefined;
};

const TemplatesGallery = ({
  headerText,
  headerId,
  actions,
  templates,
  loading,
  buildTemplateLink,
}: PropsWithChildren<TemplatesGalleryProps>) => (
  <>
    <PageContentBlock>
      <PageContentBlockHeader title={headerText} titleId={headerId} actions={actions} />
      <ScrollableCardsLayoutContainer>
        {loading && !templates ? times(3, i => <ContributeCardSkeleton key={i} />) : null}
        {templates?.map(template => (
          <TemplateCard key={template.id} template={template} {...buildTemplateLink(template)} />
        ))}
      </ScrollableCardsLayoutContainer>
    </PageContentBlock>
  </>
);

export default TemplatesGallery;
