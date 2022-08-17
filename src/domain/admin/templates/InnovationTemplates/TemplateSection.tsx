import React, { ComponentType, FC } from 'react';
import { SimpleCardProps } from '../../../shared/components/SimpleCard';
import { Template, TemplatePreviewProps } from '../AdminTemplatesSection';
import SimpleCardsList from '../../../shared/components/SimpleCardsList';
import { LinkWithState } from '../../../shared/types/LinkWithState';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';

export interface TemplateSectionProps<T extends Template> {
  templateId: string | undefined;
  templatesSetId: string | undefined;
  templates: T[] | undefined;
  buildTemplateLink: (template: T) => LinkWithState;
  onCloseTemplateDialog: () => void;
  templateCardComponent: ComponentType<Omit<SimpleCardProps, 'iconComponent'>>;
  templatePreviewComponent: ComponentType<TemplatePreviewProps<T>>;
}
// code wip; may be used for template preview on callout creation
const TemplateSectionProps = <T extends Template>({
  templateId,
  templatesSetId,
  templates,
  buildTemplateLink,
  onCloseTemplateDialog,
  templateCardComponent: TemplateCard,
  templatePreviewComponent: TemplatePreview
}: TemplateSectionProps<T>) => {
  const selectedTemplate = templateId ? templates?.find(({ id }) => id === templateId) : undefined;

  // must be passed from outside
  const [backFromTemplateDialog, buildLink] = useBackToParentPage('../');

  return (
    <>
      <SimpleCardsList>
        {templates?.map(template => (
          <TemplateCard
            key={template.id}
            title={template.info.title}
            imageUrl={template.info.visual?.uri}
            {...buildTemplateLink(template)}
          />
        ))}
      </SimpleCardsList>
    {selectedTemplate && (
      <TemplatePreview
        open
        template={selectedTemplate}
        onClose={backFromTemplateDialog}
      />
    )}
    </>
  );
};
export default TemplateSectionProps;
