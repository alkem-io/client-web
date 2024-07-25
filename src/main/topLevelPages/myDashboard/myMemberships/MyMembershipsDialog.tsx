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
import { CommunityRole } from '../../../../core/apollo/generated/graphql-schema';
import Loading from '../../../../core/ui/loading/Loading';
import MyMembershipsSpaceCard from './MyMembershipsSpaceCard';

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
  community?: {
    myRoles?: CommunityRole[];
  };
  subspaces?: MembershipProps[];
}

const MyMembershipsSpaceView = (space: MembershipProps) => (
  <MyMembershipsSpaceCard
    displayName={space.profile.displayName}
    tagline={space.profile.tagline ?? ''}
    avatar={space.profile.cardBanner?.uri}
    url={space.profile.url}
    roles={space.community?.myRoles}
    level={space.level}
    subspaces={space.subspaces}
  />
);

const MyMembershipsDialog = ({ open, onClose }: MyJourneysDialogProps) => {
  const { t } = useTranslation();

  const { data, loading } = useMyMembershipsQuery({
    skip: !open,
  });

  const landingUrl = useLandingUrl();

  const myTopLevelMemberships = useMemo(() => data?.me.spaceMemberships.filter(space => space?.level === 0), [data]);

  return (
    <DialogWithGrid open={open} onClose={onClose} columns={12}>
      <DialogHeader icon={<SpaceIcon />} title={t('pages.home.sections.myMemberships.title')} onClose={onClose} />
      <DialogContent>
        {loading && <Loading />}
        <Gutters disablePadding disableGap>
          {myTopLevelMemberships?.map(space => (
            <MyMembershipsSpaceView {...space} />
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
