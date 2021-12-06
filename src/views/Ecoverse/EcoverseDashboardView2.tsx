import React, { FC, useMemo } from 'react';
import { Grid } from '@mui/material';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import Markdown from '../../components/core/Markdown';
import { useTranslation } from 'react-i18next';
import AssociatedOrganizationsView from '../ProfileView/AssociatedOrganizationsView';
import ActivityView from '../Activity/ActivityView';

export interface EcoverseDashboardView2Props {
  title?: string;
  bannerUrl?: string;
  tagline?: string;
  vision?: string;
  organizationNameId?: string;
  activity: ActivityItem[];
  updates: any[];
  discussions: any[];
  organization?: any;
  challenges: any[];
  community?: any;
  loading: boolean;
}

const EcoverseDashboardView2: FC<EcoverseDashboardView2Props> = ({
  bannerUrl,
  title,
  tagline = '',
  vision = '',
  organizationNameId,
  activity,
  loading,
}) => {
  const { t } = useTranslation();
  const orgNameIds = useMemo(() => (organizationNameId ? [organizationNameId] : []), [organizationNameId]);
  return (
    <>
      <Grid container spacing={2}>
        <Grid container item xs={12} md={6} spacing={2}>
          <Grid item xs={12}>
            <DashboardGenericSection
              bannerUrl={bannerUrl}
              headerText={title}
              navText={t('buttons.see-more')}
              navLink={'context'}
            >
              <Markdown children={tagline} />
              <Markdown children={vision} />
            </DashboardGenericSection>
          </Grid>
          <Grid item xs={12}>
            <DashboardGenericSection headerText={t('pages.ecoverse.sections.dashboard.activity')}>
              <ActivityView activity={activity} loading={loading} />
            </DashboardGenericSection>
          </Grid>
          <Grid item xs={12}></Grid>
          <Grid item xs={12}></Grid>
        </Grid>
        <Grid container item md={6} xs={12} spacing={2}>
          <Grid item xs={12}>
            <AssociatedOrganizationsView
              title={t('pages.ecoverse.sections.dashboard.organization')}
              organizationNameIDs={orgNameIds}
            />
          </Grid>
          <Grid item xs={12}></Grid>
          <Grid item xs={12}></Grid>
        </Grid>
      </Grid>
    </>
  );
};
export default EcoverseDashboardView2;
