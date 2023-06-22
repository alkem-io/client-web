import { ComponentType, FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import Gutters from '../../../../core/ui/grid/Gutters';
import { BlockTitle } from '../../../../core/ui/typography';
import { SafeInnovationFlowVisualizer } from '../../../platform/admin/templates/InnovationTemplates/SafeInnovationFlowVisualizer';
import { PostTemplate } from '../../post/PostTemplateCard/PostTemplate';
import PostTemplateCard from '../../post/PostTemplateCard/PostTemplateCard';
import PostTemplatePreview from '../../post/PostTemplatesLibrary/PostTemplatePreview';
import { WhiteboardTemplate } from '../../whiteboard/WhiteboardTemplateCard/WhiteboardTemplate';
import WhiteboardTemplateCard from '../../whiteboard/WhiteboardTemplateCard/WhiteboardTemplateCard';
import WhiteboardTemplatePreview from '../../whiteboard/WhiteboardTemplatesLibrary/WhiteboardTemplatePreview';
import CollaborationTemplatesLibraryPreview, {
  CollaborationTemplatesLibraryPreviewProps,
} from '../../templates/CollaborationTemplatesLibrary/CollaborationTemplatesLibraryPreview';
import { TemplateCardBaseProps } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import { InnovationFlowTemplate } from '../../templates/InnovationFlowTemplateCard/InnovationFlowTemplate';
import InnovationFlowTemplateCard from '../../templates/InnovationFlowTemplateCard/InnovationFlowTemplateCard';
import { TemplateType } from '../InnovationPackProfilePage/InnovationPackProfilePage';
import { Box, Button, Tooltip } from '@mui/material';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';

export type TemplatePreview =
  | {
      template: WhiteboardTemplate;
      templateType: TemplateType.WhiteboardTemplate;
    }
  | {
      template: PostTemplate;
      templateType: TemplateType.PostTemplate;
    }
  | {
      template: InnovationFlowTemplate;
      templateType: TemplateType.InnovationFlowTemplate;
    };

const Noop = () => null;

const InnovationFlowPreview = ({ template }: { template?: InnovationFlowTemplate }) => {
  if (!template) {
    return null;
  }
  return <>{template.definition ? <SafeInnovationFlowVisualizer definition={template.definition} /> : undefined}</>;
};

interface TemplatePreviewComponentProps
  extends Omit<
    CollaborationTemplatesLibraryPreviewProps<
      TemplatePreview['template'],
      TemplatePreview['template'] & { value: string }
    >,
    'template' | 'templateCardComponent' | 'templatePreviewComponent'
  > {
  template: TemplatePreview | undefined;
  templateWithValue?: { value: string };
}

const TemplatePreviewComponent = ({ template, templateWithValue, ...props }: TemplatePreviewComponentProps) => {
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
      if (!templateWithValue) {
        return null;
      }
      const whiteboardTemplate = {
        ...templateWithValue,
        ...template.template,
      };

      return (
        <CollaborationTemplatesLibraryPreview
          {...{
            template: whiteboardTemplate,
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
            templateCardComponent: InnovationFlowTemplateCard,
            templatePreviewComponent: InnovationFlowPreview,
          }}
          {...props}
        />
      );
    }
  }
};

const DisabledUseButton: FC<{}> = () => {
  const { t } = useTranslation();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  return (
    <Tooltip
      title={t('pages.innovationLibrary.useTemplateButton')}
      open={tooltipOpen}
      onOpen={() => setTooltipOpen(true)}
      onClose={() => setTooltipOpen(false)}
      arrow
    >
      <Box onClick={() => setTooltipOpen(true)}>
        <Button
          startIcon={<SystemUpdateAltIcon />}
          disabled
          variant="contained"
          sx={{ marginLeft: theme => theme.spacing(1) }}
        >
          {t('buttons.use')}
        </Button>
      </Box>
    </Tooltip>
  );
};

interface TemplatePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  template: TemplatePreviewComponentProps['template'];
  templateWithValue: TemplatePreviewComponentProps['templateWithValue'];
  loadingTemplateValue?: boolean;
}

const TemplatePreviewDialog: FC<TemplatePreviewDialogProps> = ({
  open,
  onClose,
  template,
  templateWithValue,
  loadingTemplateValue,
}) => {
  const { t } = useTranslation();

  return (
    <DialogWithGrid open={!!open} columns={12} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <BlockTitle>{t('common.preview')}</BlockTitle>
      </DialogHeader>
      <Gutters>
        <TemplatePreviewComponent
          template={template}
          templateWithValue={templateWithValue}
          loading={loadingTemplateValue}
          onClose={onClose}
          actions={<DisabledUseButton />}
        />
      </Gutters>
    </DialogWithGrid>
  );
};

export default TemplatePreviewDialog;
