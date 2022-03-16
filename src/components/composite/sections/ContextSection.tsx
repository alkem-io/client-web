import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PublicIcon from '@mui/icons-material/Public';
import SchoolIcon from '@mui/icons-material/School';
import { Box, Grid, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactElement } from 'react-markdown';
import { Reference } from '../../../models/graphql-schema';
// import { CardLayoutContainer, CardLayoutItem } from '../../core/CardLayoutContainer/CardLayoutContainer';
import Markdown from '../../core/Markdown';
import { SectionSpacer } from '../../core/Section/Section';
import SectionHeader from '../../core/Section/SectionHeader';
// import MembershipBackdrop from '../common/Backdrops/MembershipBackdrop';
// import AspectCard from '../common/cards/AspectCard/AspectCard';
import DashboardGenericSection from '../common/sections/DashboardGenericSection';
import TagsComponent from '../common/TagsComponent/TagsComponent';
// import Button from '@mui/material/Button';
// import AspectCreationDialog, { AspectCreationOutput } from '../aspect/AspectCreationDialog/AspectCreationDialog';
// import { AspectCardFragmentDoc, useCreateAspectMutation } from '../../../hooks/generated/graphql';
// import CardFilter from '../../core/card-filter/CardFilter';
// import { aspectTagsValueGetter, aspectValueGetter } from '../../core/card-filter/value-getters/aspect-value-getter';
import References from '../common/References/References';

export interface ContextSectionProps {
  contextId?: string;
  primaryAction?: ReactElement;
  banner?: string;
  displayName?: string;
  tagline?: string;
  keywords?: string[];
  vision?: string;
  background?: string;
  impact?: string;
  who?: string;
  references?: Reference[];
  // aspects?: AspectCardFragment[];
  aspectsLoading?: boolean;
  canReadAspects?: boolean;
  canCreateAspects?: boolean;
}

const ContextSection: FC<ContextSectionProps> = ({
  // contextId,
  primaryAction,
  banner,
  background,
  displayName,
  tagline,
  keywords = [],
  vision,
  impact,
  who,
  references,
  // aspects = [],
  // aspectsLoading,
  // canReadAspects,
  // canCreateAspects,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <DashboardGenericSection
            primaryAction={primaryAction}
            bannerUrl={banner}
            headerText={displayName}
            subHeaderText={<Typography component={Markdown} variant="h5" children={tagline} color="primary" />}
            headerSpacing={'none'}
            options={{ collapsible: { maxHeight: 240 } }}
          >
            <TagsComponent tags={keywords} count={10} />
            <SectionSpacer />
            <SectionHeader text={t('components.contextSegment.vision.title')} />
            <Typography component={Markdown} variant="body1" children={vision} />
          </DashboardGenericSection>
          <SectionSpacer />
          <DashboardGenericSection
            headerText={t('components.contextSegment.background.title')}
            headerSpacing={'none'}
            primaryAction={
              <Box color="grey.main" fontSize={48} display="flex">
                <MenuBookIcon fontSize="inherit" color="inherit" />
              </Box>
            }
            options={{ collapsible: { maxHeight: 192 } }}
          >
            <Typography component={Markdown} variant="body1" children={background} />
          </DashboardGenericSection>
        </Grid>
        <Grid item xs={12} lg={6} zeroMinWidth>
          <DashboardGenericSection
            headerText={t('components.referenceSegment.title')}
            headerSpacing={'none'}
            primaryAction={
              <Box color="grey.main" fontSize={48} display="flex">
                <SchoolIcon fontSize="inherit" color="inherit" />
              </Box>
            }
            options={{ collapsible: { maxHeight: 192 } }}
          >
            <References references={references} />
          </DashboardGenericSection>
          <SectionSpacer />
          <DashboardGenericSection
            headerText={t('components.contextSegment.impact.title')}
            headerSpacing={'none'}
            primaryAction={
              <Box color="grey.main" fontSize={48} display="flex">
                <PublicIcon fontSize="inherit" color="inherit" />
              </Box>
            }
            options={{ collapsible: { maxHeight: 192 } }}
          >
            <Typography component={Markdown} variant="body1" children={impact} />
          </DashboardGenericSection>
          <SectionSpacer />
          <DashboardGenericSection
            headerText={t('components.contextSegment.who.title')}
            headerSpacing={'none'}
            primaryAction={
              <Box color="grey.main" fontSize={48} display="flex">
                <PeopleAltIcon fontSize="inherit" color="inherit" />
              </Box>
            }
            options={{ collapsible: { maxHeight: 192 } }}
          >
            <Typography component={Markdown} variant="body1" children={who} />
          </DashboardGenericSection>
        </Grid>
      </Grid>
    </>
  );
};
export default ContextSection;
