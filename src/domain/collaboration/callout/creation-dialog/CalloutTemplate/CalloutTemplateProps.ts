import { CalloutSumaryProps } from '../../CalloutSummary';

export interface CalloutTemplateProps extends CalloutSumaryProps {
  onChange?: (templateId: string) => void;
}
