import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { BlockTitle } from '../../../../core/ui/typography';
import DisabledUseButton from './DisabledUseButton';
import DialogContent from '../../../../core/ui/dialog/DialogContent';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { InnovationFlowState } from '../../../collaboration/InnovationFlow/InnovationFlow';
import WhiteboardTemplateCard from '../../cards/WhiteboardTemplateCard/WhiteboardTemplateCard';
import PostTemplateCard from '../../cards/PostTemplateCard/PostTemplateCard';
import WhiteboardTemplatePreview from '../../library/WhiteboardTemplatesLibrary/WhiteboardTemplatePreview';
import PostTemplatePreview from '../../library/PostTemplatesLibrary/PostTemplatePreview';
import CommunityGuidelinesTemplatePreview from '../../library/CommunityGuidelinesTemplateLibrary/CommunityGuidelinesTemplatePreview';
import InnovationFlowTemplateCard from '../../cards/InnovationFlowTemplateCard/InnovationFlowTemplateCard';
import InnovationFlowTemplatePreview from '../../library/InnovationFlowTemplatesLibrary/InnovationFlowTemplatePreview';
import { PostTemplate } from '../../cards/PostTemplateCard/PostTemplate';
import { TemplateBase } from '../../library/CollaborationTemplatesLibrary/TemplateBase';
import CalloutTemplateCard, { CalloutTemplate } from '../../cards/CalloutTemplateCard/CalloutTemplateCard';
import CollaborationTemplatesLibraryPreview, {
  CollaborationTemplatesLibraryPreviewProps,
} from '../../library/CollaborationTemplatesLibrary/CollaborationTemplatesLibraryPreview';
import CommunityGuidelinesTemplateCard from '../../cards/CommunityGuidelinesTemplateCard/CommunityGuidelinesTemplateCard';
import CalloutTemplatePreview from '../../library/CalloutTemplatesLibrary/CalloutTemplatePreview';
import { TemplateType } from '../../../../core/apollo/generated/graphql-schema';

export type TemplatePreview =
  | {
      template: TemplateBase & { content?: string };
      templateType: TemplateType.Whiteboard;
    }
  | {
      template: PostTemplate;
      templateType: TemplateType.Post;
    }
  | {
      template: TemplateBase & { states: InnovationFlowState[] } & Identifiable;
      templateType: TemplateType.InnovationFlow;
    }
  | {
      template: CalloutTemplate & Identifiable;
      templateType: TemplateType.Callout;
    }
  | {
      template: TemplateBase;
      templateType: TemplateType.CommunityGuidelines;
    };

const Noop = () => null;

interface TemplatePreviewChooserProps
  extends Omit<
    CollaborationTemplatesLibraryPreviewProps<TemplatePreview['template'], TemplatePreview['template']>,
    'template' | 'templateType' | 'templateCardComponent' | 'templatePreviewComponent'
  > {
  templatePreview: TemplatePreview | undefined;
}

const TemplatePreviewChooser = ({ templatePreview, ...props }: TemplatePreviewChooserProps) => {
  if (!templatePreview) {
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
  switch (templatePreview.templateType) {
    case TemplateType.Whiteboard: {
      return (
        <CollaborationTemplatesLibraryPreview
          {...{
            ...templatePreview,
            templateCardComponent: WhiteboardTemplateCard,
            templatePreviewComponent: WhiteboardTemplatePreview,
          }}
          {...props}
        />
      );
    }
    case TemplateType.Post: {
      return (
        <CollaborationTemplatesLibraryPreview
          {...{
            ...templatePreview,
            templateCardComponent: PostTemplateCard,
            templatePreviewComponent: PostTemplatePreview,
          }}
          {...props}
        />
      );
    }
    case TemplateType.InnovationFlow: {
      return (
        <CollaborationTemplatesLibraryPreview
          {...{
            ...templatePreview,
            templateCardComponent: InnovationFlowTemplateCard,
            templatePreviewComponent: InnovationFlowTemplatePreview,
          }}
          {...props}
        />
      );
    }
    case TemplateType.Callout: {
      return (
        <CollaborationTemplatesLibraryPreview
          {...{
            ...templatePreview,
            templateCardComponent: CalloutTemplateCard,
            templatePreviewComponent: CalloutTemplatePreview,
          }}
          {...props}
        />
      );
    }
    case TemplateType.CommunityGuidelines: {
      return (
        <CollaborationTemplatesLibraryPreview
          {...{
            ...templatePreview,
            templateCardComponent: CommunityGuidelinesTemplateCard,
            templatePreviewComponent: CommunityGuidelinesTemplatePreview,
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
  templatePreview: TemplatePreviewChooserProps['templatePreview'];
  innovationPack?: TemplatePreviewChooserProps['innovationPack'];
  loadingTemplateContent?: boolean;
  actions?: ReactNode;
}

const TemplatePreviewDialog: FC<TemplatePreviewDialogProps> = ({
  open = false,
  onClose,
  innovationPack,
  loadingTemplateContent,
  templatePreview,
  actions,
  ...props
}) => {
  const { t } = useTranslation();

  return (
    <DialogWithGrid open={open} columns={12} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <BlockTitle>
          {t('common.preview')} — {templatePreview?.template.profile.displayName}
        </BlockTitle>
      </DialogHeader>
      <DialogContent>
        <TemplatePreviewChooser
          templatePreview={templatePreview}
          innovationPack={innovationPack}
          loading={loadingTemplateContent}
          onClose={onClose}
          actions={actions ?? <DisabledUseButton />}
          {...props}
        />
      </DialogContent>
    </DialogWithGrid>
  );
};

export default TemplatePreviewDialog;
