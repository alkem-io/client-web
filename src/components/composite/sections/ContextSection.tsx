import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PublicIcon from '@mui/icons-material/Public';
import SchoolIcon from '@mui/icons-material/School';
import { Grid, Typography } from '@mui/material';
import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Location, Reference } from '../../../models/graphql-schema';
import Markdown from '../../core/Markdown';
import { SectionSpacer } from '../../../domain/shared/components/Section/Section';
import SectionHeader from '../../../domain/shared/components/Section/SectionHeader';
import TagsComponent from '../../../domain/shared/components/TagsComponent/TagsComponent';
import References from '../common/References/References';
import DashboardSection from './DashboardSection/DashboardSection';
import ContextSectionIcon from './ContextSectionIcon';
import DashboardColumn, { ContextSectionColumnProps } from './DashboardSection/DashboardColumn';
import LocationView from '../../../domain/location/LocationView';
import { formatLocation } from '../../../domain/location/LocationUtils';

export interface ContextSectionProps {
  contextId?: string;
  primaryAction?: ReactNode;
  displayName?: string;
  tagline?: string;
  keywords?: string[];
  location?: Location;
  vision?: string;
  background?: string;
  impact?: string;
  who?: string;
  references?: Reference[];
  loading: boolean | undefined;
  leftColumn?: ContextSectionColumnProps['children'];
  rightColumn?: ContextSectionColumnProps['children'];
}

const ContextSection: FC<ContextSectionProps> = ({
  primaryAction,
  background,
  displayName,
  tagline,
  keywords = [],
  location = undefined,
  vision,
  impact,
  who,
  references,
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
            subHeaderText={<Typography component={Markdown} variant="h5" children={tagline} color="primary" />}
            size="large"
            collapsible
          >
            <TagsComponent tags={keywords} count={10} />
            <SectionSpacer />
            <LocationView location={formatLocation(location)} />
            <SectionSpacer />
            <SectionHeader text={t('components.contextSegment.vision.title')} />
            <Typography component={Markdown} variant="body1" children={vision} />
          </DashboardSection>
          <DashboardSection
            headerText={t('components.contextSegment.background.title')}
            primaryAction={<ContextSectionIcon component={MenuBookIcon} />}
            collapsible
          >
            <Typography component={Markdown} variant="body1" children={background} />
          </DashboardSection>
          <DashboardSection
            headerText={t('components.referenceSegment.title')}
            primaryAction={<ContextSectionIcon component={SchoolIcon} />}
            collapsible
          >
            <References references={references} />
          </DashboardSection>
          <DashboardSection
            headerText={t('components.contextSegment.impact.title')}
            primaryAction={<ContextSectionIcon component={PublicIcon} />}
            collapsible
          >
            <Typography component={Markdown} variant="body1" children={impact} />
          </DashboardSection>
          <DashboardSection
            headerText={t('components.contextSegment.who.title')}
            primaryAction={<ContextSectionIcon component={PeopleAltIcon} />}
            collapsible
          >
            <Typography component={Markdown} variant="body1" children={who} />
          </DashboardSection>
          <>{leftColumn}</>
        </DashboardColumn>
        {rightColumn && <DashboardColumn>{rightColumn}</DashboardColumn>}
      </Grid>
    </>
  );
};
export default ContextSection;
