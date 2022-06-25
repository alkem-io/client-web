import { ReactNode } from 'react';
import { Box } from '@mui/material';
import ActivityCircleView, { ActivityCircleViewProps } from './ActivityCircleView';

interface SectionHeaderTextWithActivityProps extends ActivityCircleViewProps {
  headerText: ReactNode;
  activity: ReactNode;
  loading?: boolean;
}

const SectionHeaderTextWithActivity = ({ headerText, activity, loading }: SectionHeaderTextWithActivityProps) => {
  return (
    <Box display="flex" gap={2} alignItems="center">
      {headerText}
      <ActivityCircleView color="primary" loading={loading}>
        {activity}
      </ActivityCircleView>
    </Box>
  );
};

export default SectionHeaderTextWithActivity;
