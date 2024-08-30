import { FC, ReactNode } from 'react';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import ScrollableCardsLayoutContainer from '../../../../../core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import TemplateCard, { TemplateCardProps } from '../cards/TemplateCard';
import { LinkWithState } from '../../../../shared/types/LinkWithState';
import { Skeleton } from '@mui/material';

type Template = TemplateCardProps['template'];

interface TemplatesGalleryProps {
  headerText: string;
  actions?: ReactNode;
  templates: Template[] | undefined;
  loading?: boolean;
  buildTemplateLink: (template: Template) => LinkWithState;
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
      <PageContentBlock sx={{ border: '1px solid green' }}>
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
