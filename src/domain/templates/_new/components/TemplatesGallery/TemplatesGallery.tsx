import { FC, ReactNode } from 'react';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import ScrollableCardsLayoutContainer from '../../../../../core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import TemplateCard from '../cards/TemplateCard';
import { LinkWithState } from '../../../../shared/types/LinkWithState';
import { Skeleton } from '@mui/material';
import { AnyTemplate } from '../../models/TemplateBase';
import { CARLOS_BORDER_GREEN } from '../../borders';


interface TemplatesGalleryProps {
  headerText: string;
  actions?: ReactNode;

  // Provided by the container
  templates: AnyTemplate[] | undefined;
  loading?: boolean;
  buildTemplateLink: (template: AnyTemplate) => LinkWithState;
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
      <PageContentBlock sx={{ border: CARLOS_BORDER_GREEN }}>
        <PageContentBlockHeader title={headerText} actions={actions} />
        <ScrollableCardsLayoutContainer>
          {loading ? <Skeleton /> : null}
          {templates?.map(template => (
            <TemplateCard key={template.id} template={template} link={buildTemplateLink(template)} />
          ))}
        </ScrollableCardsLayoutContainer>
      </PageContentBlock>
    </>
  );
};

export default TemplatesGallery;
