import { CalloutCreationType } from '../../CalloutCreationDialog';

export interface CalloutTemplateStepProps {
  callout: CalloutCreationType;
  onChange?: (templateId: string) => void;
  onClose?: () => void;
}