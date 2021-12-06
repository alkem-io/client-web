import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { UserMetadata } from '../../../../hooks';
import { Ecoverse, Nvp } from '../../../../models/graphql-schema';
import getActivityCount from '../../../../utils/get-activity-count';
import { buildEcoverseUrl } from '../../../../utils/urlBuilders';
import HubContributionCard from '../cards/ContributionCard/HubContributionCard';
import Section, { DashboardGenericSectionProps } from './DashboardGenericSection';

interface DashboardHubSectionProps extends DashboardGenericSectionProps {
  entities: {
    hubs: (Pick<Ecoverse, 'displayName' | 'context' | 'tagset' | 'nameID'> & {
      activity?: Pick<Nvp, 'name' | 'value'>[];
    })[];
    user?: UserMetadata;
  };
  loading: {
    hubs?: boolean;
  };
}

const DashboardHubSection: FC<DashboardHubSectionProps> = ({ entities, loading, children, ...props }) => {
  const { hubs } = entities;
  const { t } = useTranslation();

  return (
    <Section {...props}>
      {children}
      <Grid container spacing={1} justifyContent="space-between" alignItems="stretch">
        {hubs.map((ecoverse, i) => {
          // const anonymousReadAccess = ecoverse?.authorization?.anonymousReadAccess;
          const activity = ecoverse.activity || [];

          return (
            <Grid item flexGrow={1} flexBasis={'50%'} key={i}>
              <HubContributionCard
                details={{
                  headerText: ecoverse.displayName,
                  descriptionText: ecoverse?.context?.tagline,
                  mediaUrl: ecoverse?.context?.visual?.background,
                  tags: ecoverse.tagset?.tags || [],
                  tagsFor: 'hub',
                  url: buildEcoverseUrl(ecoverse.nameID),
                }}
                loading={false}
                activities={[
                  {
                    name: t('pages.activity.challenges'),
                    digit: getActivityCount(activity, 'challenges') || 0,
                    color: 'primary',
                  },
                  {
                    name: t('pages.activity.opportunities'),
                    digit: getActivityCount(activity, 'opportunities') || 0,
                    color: 'primary',
                  },
                  {
                    name: t('pages.activity.members'),
                    digit: getActivityCount(activity, 'members') || 0,
                    color: 'positive',
                  },
                ]}
                // activity={ecoverse?.activity || []}
              />
            </Grid>
          );
        })}
      </Grid>
    </Section>
  );
};

export default DashboardHubSection;
