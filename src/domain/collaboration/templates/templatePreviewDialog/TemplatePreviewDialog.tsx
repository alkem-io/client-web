import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { BlockTitle } from '../../../../core/ui/typography';
import { PostTemplate } from '../../post/PostTemplateCard/PostTemplate';
import PostTemplateCard from '../../post/PostTemplateCard/PostTemplateCard';
import PostTemplatePreview from '../../post/PostTemplatesLibrary/PostTemplatePreview';
import WhiteboardTemplateCard from '../../whiteboard/WhiteboardTemplateCard/WhiteboardTemplateCard';
import WhiteboardTemplatePreview from '../../whiteboard/WhiteboardTemplatesLibrary/WhiteboardTemplatePreview';
import CollaborationTemplatesLibraryPreview, {
  CollaborationTemplatesLibraryPreviewProps,
} from '../CollaborationTemplatesLibrary/CollaborationTemplatesLibraryPreview';
import { TemplateBase } from '../CollaborationTemplatesLibrary/TemplateBase';
import InnovationFlowTemplateCard from '../../InnovationFlow/InnovationFlowTemplateCard/InnovationFlowTemplateCard';
import { TemplateType } from '../../InnovationPack/InnovationPackProfilePage/InnovationPackProfilePage';
import InnovationFlowTemplatePreview from '../../InnovationFlow/InnovationFlowTemplatesLibrary/InnovationFlowTemplatePreview';
import DisabledUseButton from './DisabledUseButton';
import DialogContent from '../../../../core/ui/dialog/DialogContent';
import { Identifiable } from '../../../../core/utils/Identifiable';
import CalloutTemplatePreview from '../calloutTemplate/CalloutTemplatePreview';
import CalloutTemplateCard, { CalloutTemplate } from '../calloutTemplate/CalloutTemplateCard';
import { InnovationFlowState } from '../../InnovationFlow/InnovationFlow';
import CommunityGuidelinesTemplateCard from '../../communityGuidelines/CommunityGuidelinesTemplateCard/CommunityGuidelinesTemplateCard';
import CommunityGuidelinesTemplatePreview from '../../communityGuidelines/CommunityGuidelinesTemplateLibrary/CommunityGuidelinesTemplatePreview';

export type TemplatePreview =
  | {
      template: TemplateBase & { content?: string };
      templateType: TemplateType.WhiteboardTemplate;
    }
  | {
      template: PostTemplate;
      templateType: TemplateType.PostTemplate;
    }
  | {
      template: TemplateBase & { states: InnovationFlowState[] } & Identifiable;
      templateType: TemplateType.InnovationFlowTemplate;
    }
  | {
      template: CalloutTemplate & Identifiable;
      templateType: TemplateType.CalloutTemplate;
    }
  | {
      template: TemplateBase;
      templateType: TemplateType.CommunityGuidelinesTemplate;
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
    case TemplateType.WhiteboardTemplate: {
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
    case TemplateType.PostTemplate: {
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
    case TemplateType.InnovationFlowTemplate: {
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
    case TemplateType.CalloutTemplate: {
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
    case TemplateType.CommunityGuidelinesTemplate: {
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
