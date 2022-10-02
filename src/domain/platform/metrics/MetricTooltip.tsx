import { alpha, Paper, Tooltip } from '@mui/material';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import React, { forwardRef } from 'react';
import { Metrics, MetricItem } from '../../../common/components/composite/common/MetricsPanel/Metrics';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import SectionSpacer from '../../shared/components/Section/SectionSpacer';

const MetricTooltipContent = forwardRef<HTMLDivElement, {}>(({ children }, ref) => {
  const { t } = useTranslation();

  return (
    <Paper ref={ref} sx={{ px: 2, py: 1, backgroundColor: theme => alpha(theme.palette.background.paper, 0.8) }}>
      <Typography variant="body2">{t('components.activity-tooltip.headline')}</Typography>
      <SectionSpacer />
      {children}
    </Paper>
  );
});

interface MetricTooltipProps {
  activityItems: MetricItem[] | undefined;
}

const MetricTooltip = ({ activityItems }: MetricTooltipProps) => {
  if (!activityItems) {
    return <AutoGraphIcon />;
  }

  return (
    <Tooltip title={<Metrics items={activityItems} />} components={{ Tooltip: MetricTooltipContent }}>
      <AutoGraphIcon />
    </Tooltip>
  );
};

export default MetricTooltip;
