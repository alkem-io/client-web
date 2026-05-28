import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { EmailChangeOutcomeClass, EmailChangeOutcomeView } from './emailChangeOutcome';

type EmailChangeOutcomeChipProps = {
  outcome: EmailChangeOutcomeView;
};

const CHIP_COLOR = {
  success: 'success',
  'success-with-warning': 'warning',
  failure: 'error',
} as const satisfies Record<EmailChangeOutcomeClass, 'success' | 'warning' | 'error'>;

const EmailChangeOutcomeChip = ({ outcome }: EmailChangeOutcomeChipProps) => {
  const { t } = useTranslation();

  return <Chip size="small" variant="outlined" color={CHIP_COLOR[outcome.class]} label={t(outcome.labelKey)} />;
};

export default EmailChangeOutcomeChip;
