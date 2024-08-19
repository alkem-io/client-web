import React, { FC, useMemo, useState } from 'react';
import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAccountSpacesQuery, useUserAccountQuery } from '../../../../core/apollo/generated/apollo-hooks';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import UserSettingsLayout from '../../../platform/admin/user/layout/UserSettingsLayout';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/constants';
import { BlockTitle } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import JourneyCardHorizontal, {
  JourneyCardHorizontalSkeleton,
} from '../../../journey/common/JourneyCardHorizontal/JourneyCardHorizontal';
import Gutters from '../../../../core/ui/grid/Gutters';
import ContributorCardHorizontal from '../../../../core/ui/card/ContributorCardHorizontal';
import InnovationPackCardHorizontal, {
  InnovationPackCardHorizontalSkeleton,
} from '../../../collaboration/InnovationPack/InnovationPackCardHorizontal/InnovationPackCardHorizontal';
import InnovationHubCardHorizontal, {
  InnovationHubCardHorizontalSkeleton,
} from '../../../innovationHub/InnovationHubCardHorizontal/InnovationHubCardHorizontal';
import { Actions } from '../../../../core/ui/actions/Actions';
import CreateInnovationPackDialog from '../../../platform/admin/templates/InnovationPacks/admin/CreateInnovationPackDialog';
import CreateSpaceDialog from '../../../journey/space/createSpace/CreateSpaceDialog';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { useUserContext } from '../hooks/useUserContext';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
import { compact } from 'lodash';
import RoundedIcon from '../../../../core/ui/icon/RoundedIcon';
import CreateInnovationHubDialog from '../../../innovationHub/CreateInnovationHub/CreateInnovationHubDialog';

interface UserAccountPageProps {}

export const UserAccountPage: FC<UserAccountPageProps> = () => {
  const { userNameId = '' } = useUrlParams();
  const { user: currentUser } = useUserContext();
  const { t } = useTranslation();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data, loading } = useUserAccountQuery({
    variables: {
      userId: userNameId,
    },
    skip: !userNameId,
  });

  const isMyProfile = data?.user.id === currentUser?.user.id;
  const canCreateSpace =
    isMyProfile && currentUser && currentUser.hasPlatformPrivilege(AuthorizationPrivilege.CreateSpace);
  const canCreateInnovationHub = currentUser && currentUser.hasPlatformPrivilege(AuthorizationPrivilege.PlatformAdmin);

  const accounts = data?.user?.accounts ?? [];
  // TODO: This will not be needed when we have multiple spaces per account and a single account per user
  const accountId = accounts[0]?.id;
  const accountHostName = data?.user.profile?.displayName;

  const { spaceIds, virtualContributors, innovationPacks, innovationHubs } = useMemo(
    () => ({
      spaceIds: compact(accounts.flatMap(account => account.spaceID)),
      virtualContributors: accounts.flatMap(account => account.virtualContributors) ?? [],
      innovationPacks: accounts.flatMap(account => account.innovationPacks) ?? [],
      innovationHubs: accounts.flatMap(account => account.innovationHubs) ?? [],
    }),
    [accounts]
  );

  const { data: spacesData, loading: spacesLoading } = useAccountSpacesQuery({
    variables: {
      spacesIds: spaceIds,
    },
    skip: !spaceIds.length,
  });

  return (
    <UserSettingsLayout currentTab={SettingsSection.Account}>
      <PageContentColumn columns={12}>
        <PageContentBlock halfWidth>
          <BlockTitle>{t('pages.admin.generic.sections.account.hostedSpaces')}</BlockTitle>
          <Gutters disablePadding>
            {spacesLoading && <JourneyCardHorizontalSkeleton />}
            {!spacesLoading &&
              spacesData?.spaces.map(space => (
                <JourneyCardHorizontal
                  journeyTypeName="space"
                  journey={space}
                  deepness={0}
                  seamless
                  sx={{ display: 'inline-block', maxWidth: '100%' }}
                />
              ))}
          </Gutters>
          <Actions>
            {canCreateSpace && (
              <>
                <IconButton
                  aria-label={t('common.add')}
                  aria-haspopup="true"
                  size="small"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <RoundedIcon component={AddIcon} size="medium" iconSize="small" />
                </IconButton>
                {createDialogOpen && (
                  <CreateSpaceDialog redirectOnComplete={false} onClose={() => setCreateDialogOpen(false)} />
                )}
              </>
            )}
          </Actions>
        </PageContentBlock>
        <PageContentBlock halfWidth>
          <BlockTitle>{t('pages.admin.generic.sections.account.virtualContributors')}</BlockTitle>
          <Gutters disablePadding>
            {loading && <JourneyCardHorizontalSkeleton />}
            {!loading && virtualContributors?.map(vc => <ContributorCardHorizontal profile={vc.profile} seamless />)}
          </Gutters>
        </PageContentBlock>
        <PageContentBlock halfWidth>
          <BlockTitle>{t('pages.admin.generic.sections.account.innovationPacks')}</BlockTitle>
          {loading && <InnovationPackCardHorizontalSkeleton />}
          {!loading && innovationPacks?.map(pack => <InnovationPackCardHorizontal {...pack} />)}
          <Actions>{isMyProfile && accountId && <CreateInnovationPackDialog accountId={accountId} />}</Actions>
        </PageContentBlock>
        <PageContentBlock halfWidth>
          <BlockTitle>{t('pages.admin.generic.sections.account.customHomepages')}</BlockTitle>
          {loading && <InnovationHubCardHorizontalSkeleton />}
          {!loading && innovationHubs?.map(hub => <InnovationHubCardHorizontal {...hub} />)}
          <Actions>
            {canCreateInnovationHub && accountId && (
              <CreateInnovationHubDialog accountId={accountId} accountHostName={accountHostName} />
            )}
          </Actions>
        </PageContentBlock>
      </PageContentColumn>
    </UserSettingsLayout>
  );
};

export default UserAccountPage;
