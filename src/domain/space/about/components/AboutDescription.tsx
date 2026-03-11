import { EditOutlined } from '@mui/icons-material';
import { Box, GridLegacy, IconButton, type SvgIconProps } from '@mui/material';
import { noop } from 'lodash-es';
import type { PropsWithChildren, ReactElement } from 'react';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import Loading from '@/core/ui/loading/Loading';
import LocationCaption from '@/core/ui/location/LocationCaption';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import DashboardMemberIcon from '@/domain/community/membership/DashboardMemberIcon/DashboardMemberIcon';
import type { Metric } from '@/domain/platform/metrics/utils/getMetricCount';
import useMetricsItems from '@/domain/platform/metrics/utils/useMetricsItems';
import { MetricViewItem } from '@/domain/platform/metrics/views/MetricsView';
import SpaceMetrics from '@/domain/space/components/SpaceMetrics';

export interface AboutDescriptionProps extends PropsWithChildren {
  title?: string;
  titleIcon?: ReactElement<SvgIconProps>;
  description?: string;
  spaceLevel?: SpaceLevel;
  loading?: boolean;
  member?: boolean;
  location?: {
    city?: string;
    country?: string;
  };
  metrics?: Metric[] | undefined;
  canEdit?: boolean;
  iconColor?: string;
  onEditClick?: () => void;
}

const AboutDescription = ({
  title,
  titleIcon,
  description,
  children,
  spaceLevel = SpaceLevel.L0,
  loading = false,
  member = false,
  location,
  metrics,
  canEdit = false,
  iconColor = 'primary',
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
              {member && (
                // negative margins because of the positioning of custom icon and IconButton
                <Box sx={{ mt: '12px', mr: '-4px' }}>
                  <DashboardMemberIcon level={spaceLevel} />
                </Box>
              )}
              {canEdit && (
                <IconButton onClick={onEditClick} sx={{ mr: '-8px', color: iconColor }}>
                  <EditOutlined color="primary" />
                </IconButton>
              )}
            </>
          }
        />
      )}
      {description && <WrapperMarkdown>{description}</WrapperMarkdown>}
      {children}
      {(location || metrics) && (
        <GridLegacy container={true} spacing={1}>
          <GridLegacy item={true} xs={6}>
            {location && <LocationCaption color="white" {...location} />}
          </GridLegacy>
          <GridLegacy item={true} xs={6}>
            {metricsItems?.[0] && <MetricViewItem text={metricsItems[0].name} count={metricsItems[0].count} />}
          </GridLegacy>
        </GridLegacy>
      )}
    </Box>
  );
};

export default AboutDescription;
