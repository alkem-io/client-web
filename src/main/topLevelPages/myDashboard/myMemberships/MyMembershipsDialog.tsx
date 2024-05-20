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
import MyMembershipsSubSpace from './MyMembershipsSubSpace';
import isJourneyMember from '../../../../domain/journey/utils/isJourneyMember';
import { Visual } from '../../../../domain/common/visual/Visual';
import {
  AuthorizationPrivilege,
  CommunityMembershipStatus,
  CommunityRole,
} from '../../../../core/apollo/generated/graphql-schema';
import { Identifiable } from '../../../../core/utils/Identifiable';

interface MyJourneysDialogProps {
  open: boolean;
  onClose: () => void;
}

interface SubspaceAccessProps extends Identifiable {
  authorization?: {
    myPrivileges?: AuthorizationPrivilege[];
  };
  community?: {
    myRoles?: CommunityRole[];
    myMembershipStatus?: CommunityMembershipStatus;
  };
}

type MembershipProps = {
  profile: {
    url: string;
    displayName: string;
    tagline: string;
    avatar?: Visual;
    cardBanner?: Visual;
  };
  community?: {
    myRoles?: CommunityRole[];
  };
  subspaces?: SubspaceAccessProps[];
};

export type MembershipType = Record<string, MembershipProps>;

const MyMembershipsDialog = ({ open, onClose }: MyJourneysDialogProps) => {
  const { t } = useTranslation();

  const { data, loading } = useMyMembershipsQuery({
    skip: !open,
  });

  const landingUrl = useLandingUrl();

  const myTopLevelMemberships = useMemo(
    () =>
      data?.me.spaceMemberships
        .filter(space => space?.level === 0)
        .map(space => {
          return {
            ...space,
          };
        }),
    [data]
  );

  // As the query returns all levels of memberships, we're using a map for ease of access to the data of each membership
  // without having to iterate over the array each time or making redundant queries for the details of every subspace
  const allMyMembershipsMap: MembershipType = useMemo(
    () =>
      (data?.me.spaceMemberships ?? []).reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    [data]
  );

  return (
    <DialogWithGrid open={open} onClose={onClose} columns={12}>
      <DialogHeader icon={<SpaceIcon />} title={t('pages.home.sections.myMemberships.title')} onClose={onClose} />
      <DialogContent>
        <Gutters disablePadding>
          {myTopLevelMemberships?.map(space => (
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
                spaceVisibility={space.account.license.visibility}
              />
              <GridItem columns={9}>
                <Gutters row disablePadding flexGrow={1} flexWrap="wrap">
                  <GridProvider columns={8}>
                    {space.subspaces?.filter(isJourneyMember).map(subspace => (
                      <MyMembershipsSubSpace key={subspace.id} subspace={subspace} memberships={allMyMembershipsMap} />
                    ))}
                    {!loading && !space.subspaces?.length && (
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
                spaces: <RouterLink to="/spaces" underline="always" />,
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
