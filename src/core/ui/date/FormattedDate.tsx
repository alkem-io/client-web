import { Caption } from '@/core/ui/typography';
import { formatDateTime } from '@/core/utils/time/utils';
import { Tooltip } from '@mui/material';
import { formatTimeElapsed } from '../../../domain/shared/utils/formatTimeElapsed';
import { useTranslation } from 'react-i18next';

interface FormattedDateProps {
  date: string | Date | undefined;
  component?: React.ElementType;
  format?: Parameters<typeof formatTimeElapsed>[2];
}

const FormattedDate = ({ date, component: Component = Caption, format = 'long' }: FormattedDateProps) => {
  const { t } = useTranslation();
  if (!date) {
    return null;
  }
  return (
    <Tooltip title={formatDateTime(date)} arrow>
      <span style={{ cursor: 'default' }}>
        <Component>{formatTimeElapsed(date, t, format)}</Component>
      </span>
    </Tooltip>
  );
};

export default FormattedDate;
