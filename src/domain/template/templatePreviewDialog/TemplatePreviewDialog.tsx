import { ComponentType, FC } from 'react';
import { useTranslation } from 'react-i18next';
import DialogHeader from '../../../core/ui/dialog/DialogHeader';
import DialogWithGrid from '../../../core/ui/dialog/DialogWithGrid';
import { BlockTitle } from '../../../core/ui/typography';
import { PostTemplate } from '../../collaboration/post/PostTemplateCard/PostTemplate';
import PostTemplateCard from '../../collaboration/post/PostTemplateCard/PostTemplateCard';
import PostTemplatePreview from '../../collaboration/post/PostTemplatesLibrary/PostTemplatePreview';
import WhiteboardTemplateCard from '../../collaboration/whiteboard/WhiteboardTemplateCard/WhiteboardTemplateCard';
import WhiteboardTemplatePreview from '../../collaboration/whiteboard/WhiteboardTemplatesLibrary/WhiteboardTemplatePreview';
import CollaborationTemplatesLibraryPreview, {
  CollaborationTemplatesLibraryPreviewProps,
} from '../../collaboration/templates/CollaborationTemplatesLibrary/CollaborationTemplatesLibraryPreview';
import {
  TemplateBase,
  TemplateCardBaseProps,
} from '../../collaboration/templates/CollaborationTemplatesLibrary/TemplateBase';
import InnovationFlowTemplateCard from '../../collaboration/InnovationFlow/InnovationFlowTemplateCard/InnovationFlowTemplateCard';
import { TemplateType } from '../../collaboration/InnovationPack/InnovationPackProfilePage/InnovationPackProfilePage';
import InnovationFlowTemplatePreview from '../../collaboration/InnovationFlow/InnovationFlowTemplatesLibrary/InnovationFlowTemplatePreview';
import DisabledUseButton from './DisabledUseButton';
import DialogContent from '../../../core/ui/dialog/DialogContent';
import { Identifiable } from '../../../core/utils/Identifiable';

export type TemplatePreview =
  | {
      template: TemplateBase;
      templateType: TemplateType.WhiteboardTemplate;
    }
  | {
      template: PostTemplate;
      templateType: TemplateType.PostTemplate;
    }
  | {
      template: TemplateBase & Identifiable;
      templateType: TemplateType.InnovationFlowTemplate;
    }
  | {
      template: TemplateBase & Identifiable;
      templateType: TemplateType.CalloutTemplate;
    };

const Noop = () => null;

interface TemplatePreviewComponentProps
  extends Omit<
    CollaborationTemplatesLibraryPreviewProps<
      TemplatePreview['template'],
      TemplatePreview['template'] & { content: string }
    >,
    'template' | 'templateType' | 'templateCardComponent' | 'templatePreviewComponent'
  > {
  template: TemplatePreview | undefined;
  templateWithContent?: { content: string };
}

const TemplatePreviewComponent = ({ template, templateWithContent, ...props }: TemplatePreviewComponentProps) => {
  if (!template) {
    return (
      <CollaborationTemplatesLibraryPreview
        {...{
          template: undefined,
          templateCardComponent: Noop,
          templatePreviewComponent: Noop,
        }}
        {...props}
      />
    );
  }
  switch (template.templateType) {
    case TemplateType.WhiteboardTemplate: {
      if (!templateWithContent) {
        return null;
      }
      const whiteboardTemplate = {
        ...templateWithContent,
        ...template.template,
      };

      return (
        <CollaborationTemplatesLibraryPreview
          {...{
            template: whiteboardTemplate,
            templateType: template.templateType,
            templateCardComponent: WhiteboardTemplateCard,
            templatePreviewComponent: WhiteboardTemplatePreview,
          }}
          {...props}
        />
      );
    }
    case TemplateType.PostTemplate: {
      return (
        <CollaborationTemplatesLibraryPreview
          {...{
            template: template.template,
            templateType: template.templateType,
            templateCardComponent: PostTemplateCard as ComponentType<TemplateCardBaseProps<PostTemplate>>,
            templatePreviewComponent: PostTemplatePreview,
          }}
          {...props}
        />
      );
    }
    case TemplateType.InnovationFlowTemplate: {
      return (
        <CollaborationTemplatesLibraryPreview
          {...{
            template: template.template,
            templateType: template.templateType,
            templateCardComponent: InnovationFlowTemplateCard,
            templatePreviewComponent: InnovationFlowTemplatePreview,
          }}
          {...props}
        />
      );
    }
    case TemplateType.CalloutTemplate: {
      return (
        <CollaborationTemplatesLibraryPreview
          {...{
            template: template.template,
            templateType: template.templateType,
            templateCardComponent: InnovationFlowTemplateCard,
            templatePreviewComponent: InnovationFlowTemplatePreview,
          }}
          {...props}
        />
      );
    }
  }
};

export interface TemplatePreviewDialogProps {
  open?: boolean;
  onClose: () => void;
  template: TemplatePreviewComponentProps['template'];
  innovationPack?: TemplatePreviewComponentProps['innovationPack'];
  templateWithContent: TemplatePreviewComponentProps['templateWithContent'];
  loadingTemplateContent?: boolean;
}

const TemplatePreviewDialog: FC<TemplatePreviewDialogProps> = ({
  open = false,
  onClose,
  template,
  templateWithContent,
  innovationPack,
  loadingTemplateContent,
}) => {
  const { t } = useTranslation();

  return (
    <DialogWithGrid open={open} columns={12} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <BlockTitle>{t('common.preview')}</BlockTitle>
      </DialogHeader>
      <DialogContent>
        <TemplatePreviewComponent
          template={template}
          templateWithContent={templateWithContent}
          innovationPack={innovationPack}
          loading={loadingTemplateContent}
          onClose={onClose}
          actions={<DisabledUseButton />}
        />
      </DialogContent>
    </DialogWithGrid>
  );
};

export default TemplatePreviewDialog;
