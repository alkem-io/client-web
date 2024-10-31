import { ReactNode } from 'react';

import { times } from 'lodash';

import TemplateCard from '../cards/TemplateCard';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import ContributeCardSkeleton from '../../../../core/ui/card/ContributeCardSkeleton';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import ScrollableCardsLayoutContainer from '../../../../core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';

import { type AnyTemplate } from '../../models/TemplateBase';
import { type LinkWithState } from '../../../shared/types/LinkWithState';

const TemplatesGallery = ({ actions, loading, templates, headerText, buildTemplateLink }: TemplatesGalleryProps) => (
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

export default TemplatesGallery;

type TemplatesGalleryProps = {
  headerText: string;
  // Provided by the container
  templates: AnyTemplate[] | undefined;
  buildTemplateLink: (template: AnyTemplate) => LinkWithState | undefined;

  loading?: boolean;
  actions?: ReactNode;
};
