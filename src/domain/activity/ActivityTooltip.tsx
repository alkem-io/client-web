import { alpha, Paper, Tooltip } from '@mui/material';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import React, { forwardRef } from 'react';
import { Activities, ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import SectionSpacer from '../shared/components/Section/SectionSpacer';

const ActivityTooltipContent = forwardRef<HTMLDivElement, {}>(({ children }, ref) => {
  const { t } = useTranslation();

  return (
    <Paper ref={ref} sx={{ px: 2, py: 1, backgroundColor: theme => alpha(theme.palette.background.paper, 0.8) }}>
      <Typography variant="body2">{t('components.activity-tooltip.headline')}</Typography>
      <SectionSpacer />
      {children}
    </Paper>
  );
});

interface ActivityTooltipProps {
  activityItems: ActivityItem[] | undefined;
}

const ActivityTooltip = ({ activityItems }: ActivityTooltipProps) => {
  if (!activityItems) {
    return <AutoGraphIcon />;
  }

  return (
    <Tooltip title={<Activities items={activityItems} />} components={{ Tooltip: ActivityTooltipContent }}>
      <AutoGraphIcon />
    </Tooltip>
  );
};

export default ActivityTooltip;
