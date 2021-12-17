import { Grid } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UserMetadata } from '../../../../hooks';
import { Ecoverse, Nvp } from '../../../../models/graphql-schema';
import getActivityCount from '../../../../utils/get-activity-count';
import { buildEcoverseUrl } from '../../../../utils/urlBuilders';
import EntityContributionCard from '../cards/ContributionCard/EntityContributionCard';
import Section, { DashboardGenericSectionProps } from './DashboardGenericSection';

interface DashboardHubSectionProps extends DashboardGenericSectionProps {
  entities: {
    hubs: (Pick<Ecoverse, 'id' | 'displayName' | 'context' | 'tagset' | 'nameID' | 'authorization'> & {
      activity?: Pick<Nvp, 'name' | 'value'>[];
    })[];
    user?: UserMetadata;
  };
  options: {
    itemBasis: '25%' | '33%' | '50%';
  };
  loading: {
    hubs?: boolean;
  };
}

const useStyles = makeStyles(theme => ({
  memberTag: {
    background: theme.palette.augmentColor({ color: theme.palette.positive }).dark,
  },
}));

const DashboardHubSection: FC<DashboardHubSectionProps> = ({ entities, loading, children, options, ...props }) => {
  const { hubs, user } = entities;
  const { t } = useTranslation();
  const styles = useStyles();
  const isMember = useCallback(
    (hubId: string) => {
      return user?.ofEcoverse(hubId) || false;
    },
    [user]
  );
  const getCardLabel = useCallback(
    (hubId: string, isHubAnonymous: boolean) => {
      const isUserMember = isMember(hubId);
      if (isUserMember) {
        return t('components.card.member');
      } else if (!isHubAnonymous) {
        return t('components.card.private');
      } else {
        return undefined;
      }
    },
    [isMember]
  );

  return (
    <Section {...props}>
      {children}
      <Grid container spacing={2} justifyContent="space-between" alignItems="stretch">
        {hubs.map((ecoverse, i) => {
          const activity = ecoverse.activity || [];

          return (
            <Grid
              item
              flexGrow={1}
              flexBasis={options.itemBasis || '50%'}
              maxWidth={{ xs: 'auto', sm: 'auto', md: i === hubs.length - 1 ? '50%' : 'auto' }}
              key={i}
            >
              <EntityContributionCard
                details={{
                  headerText: ecoverse.displayName,
                  descriptionText: ecoverse?.context?.tagline,
                  mediaUrl: ecoverse?.context?.visual?.banner,
                  labelText: getCardLabel(ecoverse.id, ecoverse.authorization?.anonymousReadAccess || false),
                  tags: ecoverse.tagset?.tags || [],
                  tagsFor: 'hub',
                  url: buildEcoverseUrl(ecoverse.nameID),
                }}
                classes={{
                  label: clsx(isMember(ecoverse.id) && styles.memberTag),
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
