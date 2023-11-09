import React, { ComponentType, ReactNode } from 'react';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import EllipsableWithCount from '../../../../core/ui/typography/EllipsableWithCount';
import ScrollableCardsLayoutContainer from '../../../../core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import { CaptionSmall } from '../../../../core/ui/typography';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { Identifiables } from '../../../../core/utils/Identifiable';
import { TemplateBase, TemplateCardBaseProps } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';

interface TemplatesBlockProps<Template extends TemplateBase, TemplateType> {
  templates: Identifiables<Template> | undefined;
  title: ReactNode;
  innovationPack?: TemplateCardBaseProps<Template>['innovationPack'];
  templateType: TemplateType;
  onClickCard: ({ template: TemplateCardProps, templateType: TemplateType }) => void;
  emptyLabel: ReactNode;
  cardComponent: ComponentType<TemplateCardBaseProps<Template>>;
}

const TemplatesBlock = <Template extends TemplateBase, TemplateType>({
  templates,
  title,
  innovationPack,
  templateType,
  emptyLabel,
  cardComponent: Card,
  onClickCard,
}: TemplatesBlockProps<Template, TemplateType>) => {
  const handleClick = (template: Template) => onClickCard({ template, templateType });

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={<EllipsableWithCount count={templates?.length}>{title}</EllipsableWithCount>} />
      <ScrollableCardsLayoutContainer>
        {templates?.map(template => (
          <Card
            key={template.id}
            template={template}
            innovationPack={innovationPack}
            onClick={() => handleClick(template)}
          />
        ))}
        {templates?.length === 0 && <CaptionSmall>{emptyLabel}</CaptionSmall>}
      </ScrollableCardsLayoutContainer>
    </PageContentBlock>
  );
};

export default TemplatesBlock;
