import { ReactElement } from 'react';
import { Box, Grid, SvgIconProps } from '@mui/material';
import Loading from '@/core/ui/loading/Loading';
import DashboardMemberIcon from '@/domain/community/membership/DashboardMemberIcon/DashboardMemberIcon';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import LocationCaption from '@/core/ui/location/LocationCaption';
import { MetricViewItem } from '@/domain/platform/metrics/views/MetricsView';
import { Metric } from '@/domain/platform/metrics/utils/getMetricCount';
import SpaceMetrics from '@/domain/journey/space/Metrics/SpaceMetrics';
import useMetricsItems from '@/domain/platform/metrics/utils/useMetricsItems';
import { EditOutlined } from '@mui/icons-material';
import { noop } from 'lodash';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';

export interface AboutDescriptionProps {
  title?: string;
  titleIcon?: ReactElement<SvgIconProps>;
  description: string | undefined;
  spaceLevel?: SpaceLevel;
  loading?: boolean;
  member?: false;
  location?: {
    city?: string;
    country?: string;
  };
  metrics?: Metric[] | undefined;
  canEdit?: boolean;
  onEditClick?: () => void;
}

const AboutDescription = ({
  title,
  titleIcon,
  description,
  spaceLevel = SpaceLevel.L0,
  loading = false,
  member = false,
  location,
  metrics,
  canEdit = false,
  onEditClick = noop,
}: AboutDescriptionProps) => {
  const metricsItems = useMetricsItems(metrics, SpaceMetrics);

  if (loading) {
    return <Loading />;
  }

  const visibleHeading = title || member || canEdit;

  return (
    <Box>
      {visibleHeading && (
        <PageContentBlockHeader
          icon={titleIcon}
          title={title}
          actions={
            <>
              {canEdit && (
                <Box onClick={onEditClick} paddingLeft={0.5} paddingBottom={1} sx={{ float: 'right' }}>
                  <EditOutlined />
                </Box>
              )}
              {member && <DashboardMemberIcon level={spaceLevel} />}
            </>
          }
        />
      )}
      {description && <WrapperMarkdown>{description}</WrapperMarkdown>}

      {(location || metrics) && (
        <Grid container spacing={1}>
          <Grid item xs={6}>
            {location && <LocationCaption color="white" {...location} />}
          </Grid>
          <Grid item xs={6}>
            {metricsItems?.[0] && <MetricViewItem text={metricsItems[0].name} count={metricsItems[0].count} />}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AboutDescription;
