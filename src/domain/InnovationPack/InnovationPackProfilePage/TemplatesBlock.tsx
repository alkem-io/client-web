import React, { ComponentType, ReactNode } from 'react';
import PageContentBlockHeader from '../../../core/ui/content/PageContentBlockHeader';
import EllipsableWithCount from '../../../core/ui/typography/EllipsableWithCount';
import ScrollableCardsLayoutContainer from '../../../core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import PageContentBlock from '../../../core/ui/content/PageContentBlock';
import { Identifiables } from '../../../core/utils/Identifiable';
import {
  TemplateBase,
  TemplateCardBaseProps,
} from '../../templates/library/CollaborationTemplatesLibrary/TemplateBase';

interface TemplatesBlockProps<Template extends TemplateBase, TemplateType> {
  templates: Identifiables<Template> | undefined;
  title: ReactNode;
  innovationPack?: TemplateCardBaseProps<Template>['innovationPack'];
  templateType: TemplateType;
  // @ts-ignore TS5UPGRADE
  onClickCard: ({ template: TemplateCardProps, templateType: TemplateType }) => void;
  cardComponent: ComponentType<TemplateCardBaseProps<Template>>;
}

const TemplatesBlock = <Template extends TemplateBase, TemplateType>({
  templates,
  title,
  innovationPack,
  templateType,
  cardComponent: Card,
  onClickCard,
}: TemplatesBlockProps<Template, TemplateType>) => {
  const handleClick = (template: Template) => onClickCard({ template, templateType });

  return !!templates?.length ? (
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
      </ScrollableCardsLayoutContainer>
    </PageContentBlock>
  ) : null;
};

export default TemplatesBlock;
