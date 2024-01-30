import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { Trans, useTranslation } from 'react-i18next';
import Gutters from '../../../../core/ui/grid/Gutters';
import { DialogContent } from '@mui/material';
import { useMyMembershipsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import SpaceCard from '../../../../domain/journey/space/SpaceCard/SpaceCard';
import getMetricCount from '../../../../domain/platform/metrics/utils/getMetricCount';
import { MetricType } from '../../../../domain/platform/metrics/MetricType';
import { Caption } from '../../../../core/ui/typography';
import React, { useMemo } from 'react';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import GridItem from '../../../../core/ui/grid/GridItem';
import RouterLink from '../../../../core/ui/link/RouterLink';
import useLandingUrl from '../../../landing/useLandingUrl';
import { SpaceIcon } from '../../../../domain/journey/space/icon/SpaceIcon';
import MyMembershipsChallenge from './MyMembershipsChallenge';
import isJourneyMember from '../../../../domain/journey/utils/isJourneyMember';

interface MyJourneysDialogProps {
  open: boolean;
  onClose: () => void;
}

const MyMembershipsDialog = ({ open, onClose }: MyJourneysDialogProps) => {
  const { t } = useTranslation();

  const { data, loading } = useMyMembershipsQuery();

  const landingUrl = useLandingUrl();

  const myMemberships = useMemo(
    () =>
      data?.me.spaceMemberships.map(space => {
        return {
          ...space,
          challenges: space.challenges?.filter(isJourneyMember),
        };
      }),
    [data]
  );

  return (
    <DialogWithGrid open={open} onClose={onClose} columns={12}>
      <DialogHeader icon={<SpaceIcon />} title={t('pages.home.sections.myMemberships.title')} onClose={onClose} />
      <DialogContent>
        <Gutters disablePadding>
          {myMemberships?.map(space => (
            <PageContentBlock
              row
              flexWrap="wrap"
              sx={{
                background: theme => theme.palette.background.default,
                alignItems: 'start',
              }}
            >
              <SpaceCard
                banner={space.profile.cardBanner}
                displayName={space.profile.displayName}
                vision={space.context?.vision ?? ''}
                tagline={space.profile.tagline}
                journeyUri={space.profile.url}
                tags={space.profile.tagset?.tags ?? []}
                membersCount={getMetricCount(space.metrics, MetricType.Member)}
                spaceVisibility={space.license.visibility}
              />
              <GridItem columns={9}>
                <Gutters row disablePadding flexGrow={1} flexWrap="wrap">
                  <GridProvider columns={8}>
                    {space.challenges?.map(challenge => (
                      <MyMembershipsChallenge key={challenge.id} challenge={challenge} />
                    ))}
                    {!loading && !space.challenges?.length && (
                      <Caption alignSelf="center">{t('pages.home.sections.myMemberships.noChildMemberships')}</Caption>
                    )}
                  </GridProvider>
                </Gutters>
              </GridItem>
            </PageContentBlock>
          ))}
          <Caption alignSelf="center">
            <Trans
              i18nKey="pages.home.sections.myMemberships.seeMore"
              components={{
                challenges: <RouterLink to="/challenges" underline="always" />,
                landing: <RouterLink to={landingUrl ?? ''} underline="always" />,
              }}
            />
          </Caption>
        </Gutters>
      </DialogContent>
    </DialogWithGrid>
  );
};

export default MyMembershipsDialog;
