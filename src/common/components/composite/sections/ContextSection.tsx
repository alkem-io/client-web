import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PublicIcon from '@mui/icons-material/Public';
import { Grid, Typography } from '@mui/material';
import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Location } from '../../../../models/graphql-schema';
import WrapperMarkdown from '../../core/WrapperMarkdown';
import { SectionSpacer } from '../../../../domain/shared/components/Section/Section';
import SectionHeader from '../../../../domain/shared/components/Section/SectionHeader';
import TagsComponent from '../../../../domain/shared/components/TagsComponent/TagsComponent';
import DashboardSection from './DashboardSection/DashboardSection';
import ContextSectionIcon from './ContextSectionIcon';
import DashboardColumn, { ContextSectionColumnProps } from './DashboardSection/DashboardColumn';
import LocationView from '../../../../domain/common/location/LocationView';
import { formatLocation } from '../../../../domain/common/location/LocationUtils';

export type JourneyType = 'hub' | 'challenge' | 'opportunity';

export interface ContextSectionProps {
  contextId?: string;
  contextType: JourneyType;
  primaryAction?: ReactNode;
  displayName?: string;
  tagline?: string;
  keywords?: string[];
  location?: Location;
  vision?: string;
  background?: string;
  impact?: string;
  who?: string;
  loading: boolean | undefined;
  leftColumn?: ContextSectionColumnProps['children'];
  rightColumn?: ContextSectionColumnProps['children'];
}

const ContextSection: FC<ContextSectionProps> = ({
  contextType,
  primaryAction,
  background,
  displayName,
  tagline,
  keywords = [],
  location = undefined,
  vision,
  impact,
  who,
  leftColumn,
  rightColumn,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Grid container spacing={2}>
        <DashboardColumn>
          <DashboardSection
            primaryAction={primaryAction}
            headerText={displayName}
            subHeaderText={<Typography component={WrapperMarkdown} variant="h5" children={tagline} color="primary" />}
            size="large"
            collapsible
          >
            <TagsComponent tags={keywords} count={10} />
            <SectionSpacer />
            <LocationView location={formatLocation(location)} />
            <SectionSpacer />
            <SectionHeader text={t(`components.contextSegment.${contextType}.vision.title` as const)} />
            <Typography component={WrapperMarkdown} variant="body1" children={vision} />
          </DashboardSection>
          <DashboardSection
            headerText={t(`components.contextSegment.${contextType}.background.title` as const)}
            primaryAction={<ContextSectionIcon component={MenuBookIcon} />}
            collapsible
          >
            <Typography component={WrapperMarkdown} variant="body1" children={background} />
          </DashboardSection>
          <DashboardSection
            headerText={t(`components.contextSegment.${contextType}.impact.title` as const)}
            primaryAction={<ContextSectionIcon component={PublicIcon} />}
            collapsible
          >
            <Typography component={WrapperMarkdown} variant="body1" children={impact} />
          </DashboardSection>
          <DashboardSection
            headerText={t(`components.contextSegment.${contextType}.who.title` as const)}
            primaryAction={<ContextSectionIcon component={PeopleAltIcon} />}
            collapsible
          >
            <Typography component={WrapperMarkdown} variant="body1" children={who} />
          </DashboardSection>
          <>{leftColumn}</>
        </DashboardColumn>
        {rightColumn && <DashboardColumn>{rightColumn}</DashboardColumn>}
      </Grid>
    </>
  );
};
export default ContextSection;
