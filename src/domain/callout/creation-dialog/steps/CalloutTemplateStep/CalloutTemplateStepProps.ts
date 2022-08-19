import { CalloutStepProps } from '../CalloutStepProps';

export interface CalloutTemplateStepProps extends CalloutStepProps {
  onChange?: (templateId: string) => void;
}
