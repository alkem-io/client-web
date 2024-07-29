import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { DialogContent } from '@mui/material';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import Gutters from '../../../../core/ui/grid/Gutters';
import { useMyMembershipsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { Caption } from '../../../../core/ui/typography';
import RouterLink from '../../../../core/ui/link/RouterLink';
import useLandingUrl from '../../../landing/useLandingUrl';
import { SpaceIcon } from '../../../../domain/journey/space/icon/SpaceIcon';
import { Visual } from '../../../../domain/common/visual/Visual';
import {
  AuthorizationPrivilege,
  CommunityMembershipStatus,
  CommunityRole,
} from '../../../../core/apollo/generated/graphql-schema';
import Loading from '../../../../core/ui/loading/Loading';
import ExpandableSpaceTree from './ExpandableSpaceTree';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { gutters } from '../../../../core/ui/grid/utils';
import isJourneyMember from '../../../../domain/journey/utils/isJourneyMember';

interface MyJourneysDialogProps {
  open: boolean;
  onClose: () => void;
}

export interface SubspaceAccessProps extends Identifiable {
  authorization?: {
    myPrivileges?: AuthorizationPrivilege[];
  };
  community?: {
    myRoles?: CommunityRole[];
    myMembershipStatus?: CommunityMembershipStatus;
  };
}

export interface MembershipProps {
  id: string;
  profile: {
    url: string;
    displayName: string;
    tagline: string;
    avatar?: Visual;
    cardBanner?: Visual;
  };
  level: number;
  community?: {
    myRoles?: CommunityRole[];
  };
  subspaces?: SubspaceAccessProps[];
}

const MyMembershipsDialog = ({ open, onClose }: MyJourneysDialogProps) => {
  const { t } = useTranslation();

  const { data, loading } = useMyMembershipsQuery({
    skip: !open,
  });

  const landingUrl = useLandingUrl();

  const myTopLevelMemberships = useMemo(() => data?.me.spaceMemberships.filter(space => space?.level === 0), [data]);

  // As the query returns all levels of memberships, we're using a map for ease of access to the data of each membership
  // without having to iterate over the array each time or making redundant queries for the details of every subspace
  const allMyMembershipsMap: Record<string, MembershipProps> = useMemo(
    () =>
      (data?.me.spaceMemberships ?? []).reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    [data]
  );

  const getMembership = (id: string) => allMyMembershipsMap[id];

  return (
    <DialogWithGrid open={open} onClose={onClose} columns={8}>
      <DialogHeader icon={<SpaceIcon />} title={t('pages.home.sections.myMemberships.title')} onClose={onClose} />
      <DialogContent style={{ paddingTop: 0 }}>
        {loading && <Loading />}
        <Gutters disablePadding disableGap>
          {myTopLevelMemberships?.map(space => (
            <ExpandableSpaceTree
              space={space}
              subspaces={space.subspaces?.filter(isJourneyMember)}
              getMembershipWithDetails={getMembership}
            />
          ))}
          <Caption alignSelf="center" paddingTop={gutters(0.5)}>
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
