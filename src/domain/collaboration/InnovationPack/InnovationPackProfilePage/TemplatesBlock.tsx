import React, { ComponentType, ReactNode } from 'react';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import EllipsableWithCount from '../../../../core/ui/typography/EllipsableWithCount';
import ScrollableCardsLayoutContainer from '../../../../core/ui/card/CardsLayout/ScrollableCardsLayoutContainer';
import { CaptionSmall } from '../../../../core/ui/typography';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { Identifiable } from '../../../shared/types/Identifiable';
import { TemplateCardInnovationPack, TemplateCardProviderProfile } from '../../templates/TemplateCard/Types';
import { TemplateCardBaseProps } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';

interface TemplatesBlockProps<Template extends Identifiable, TemplateCardProps extends Identifiable, TemplateType> {
  templates: Template[] | undefined;
  title: ReactNode;
  mapper: (
    template: Template,
    providerProfile?: TemplateCardProviderProfile,
    innovationPack?: TemplateCardInnovationPack
  ) => TemplateCardProps;
  providerProfile?: TemplateCardProviderProfile;
  innovationPack?: TemplateCardInnovationPack;
  templateType: TemplateType;
  onClickCard: ({ template: TemplateCardProps, templateType: TemplateType }) => void;
  emptyLabel: ReactNode;
  cardComponent: ComponentType<TemplateCardBaseProps<TemplateCardProps>>;
}

const TemplatesBlock = <Template extends Identifiable, TemplateCardProps extends Identifiable, TemplateType>({
  templates,
  title,
  providerProfile,
  innovationPack,
  mapper,
  templateType,
  emptyLabel,
  cardComponent: Card,
  onClickCard,
}: TemplatesBlockProps<Template, TemplateCardProps, TemplateType>) => {
  const handleClick = (template: TemplateCardProps) => onClickCard({ template, templateType });

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={<EllipsableWithCount count={templates?.length}>{title}</EllipsableWithCount>} />
      <ScrollableCardsLayoutContainer>
        {templates
          ?.map(template => mapper(template, providerProfile, innovationPack))
          .map(template => (
            <Card key={template.id} template={template} onClick={() => handleClick(template)} />
          ))}
        {templates?.length === 0 && <CaptionSmall>{emptyLabel}</CaptionSmall>}
      </ScrollableCardsLayoutContainer>
    </PageContentBlock>
  );
};

export default TemplatesBlock;
