import React from 'react';
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
  CommunityRoleType,
} from '../../../../core/apollo/generated/graphql-schema';
import Loading from '../../../../core/ui/loading/Loading';
import ExpandableSpaceTree from './ExpandableSpaceTree';
import { gutters } from '../../../../core/ui/grid/utils';

interface MyJourneysDialogProps {
  open: boolean;
  onClose: () => void;
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
  authorization?: {
    myPrivileges?: AuthorizationPrivilege[];
  };
  community?: {
    myRoles?: CommunityRoleType[];
    myMembershipStatus?: CommunityMembershipStatus;
  };
  childMemberships?: MembershipProps[];
}

const MyMembershipsDialog = ({ open, onClose }: MyJourneysDialogProps) => {
  const { t } = useTranslation();

  const { data, loading } = useMyMembershipsQuery({
    skip: !open,
  });

  const landingUrl = useLandingUrl();

  return (
    <DialogWithGrid open={open} onClose={onClose} columns={8}>
      <DialogHeader icon={<SpaceIcon />} title={t('pages.home.sections.myMemberships.title')} onClose={onClose} />
      <DialogContent style={{ paddingTop: 0 }}>
        {loading && <Loading />}
        <Gutters disablePadding disableGap>
          {data?.me.spaceMembershipsHierarchical?.map(spaceMembership => (
            <ExpandableSpaceTree key={spaceMembership.id} membership={spaceMembership} />
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
