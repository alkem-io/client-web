import { FC, ReactNode } from 'react';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import ScrollableCardsLayoutContainer from '@/core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import TemplateCard from '../cards/TemplateCard';
import { LinkWithState } from '../../../shared/types/LinkWithState';
import { AnyTemplate } from '../../models/TemplateBase';
import ContributeCardSkeleton from '@/core/ui/card/ContributeCardSkeleton';
import { times } from 'lodash';

interface TemplatesGalleryProps {
  headerText: string;
  actions?: ReactNode;

  // Provided by the container
  templates: AnyTemplate[] | undefined;
  loading?: boolean;
  buildTemplateLink: (template: AnyTemplate) => LinkWithState | undefined;
}

const TemplatesGallery: FC<TemplatesGalleryProps> = ({
  headerText,
  actions,
  templates,
  loading,
  buildTemplateLink,
}) => {
  return (
    <>
      <PageContentBlock>
        <PageContentBlockHeader title={headerText} actions={actions} />
        <ScrollableCardsLayoutContainer>
          {loading && !templates ? times(3, i => <ContributeCardSkeleton key={i} />) : null}
          {templates?.map(template => (
            <TemplateCard key={template.id} template={template} link={buildTemplateLink(template)} />
          ))}
        </ScrollableCardsLayoutContainer>
      </PageContentBlock>
    </>
  );
};

export default TemplatesGallery;
