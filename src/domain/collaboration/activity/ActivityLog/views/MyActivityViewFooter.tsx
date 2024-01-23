import { Box } from '@mui/material';
import { Caption } from '../../../../../core/ui/typography';
import { formatTimeElapsed } from '../../../../shared/utils/formatTimeElapsed';
import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';

interface MyActivityViewFooterProps {
  contextDisplayName: ReactNode;
  createdDate: Date | string;
}

const Separator = () => <Caption whiteSpace="pre">{' · '}</Caption>;

const MyActivityViewFooter = ({ contextDisplayName, createdDate }: MyActivityViewFooterProps) => {
  const { t } = useTranslation();

  return (
    <Box display="flex" sx={{ '& > *': { flexShrink: 0 }, color: 'neutral.light' }}>
      <Caption noWrap flexShrink={1}>
        {contextDisplayName}
      </Caption>
      <Separator />
      <Caption>{formatTimeElapsed(createdDate, t)}</Caption>
    </Box>
  );
};

export default MyActivityViewFooter;
