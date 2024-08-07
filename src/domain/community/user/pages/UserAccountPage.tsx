import React, { FC, useMemo } from 'react';
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

interface UserAccountPageProps {}

export const UserAccountPage: FC<UserAccountPageProps> = () => {
  const { userNameId = '' } = useUrlParams();
  const { user: currentUser } = useUserContext();
  const { t } = useTranslation();

  const { data, loading } = useUserAccountQuery({
    variables: {
      userId: userNameId,
    },
    skip: !userNameId,
  });

  const isMyProfile = data?.user.id === currentUser?.user.id;
  const canCreateSpace =
    isMyProfile && currentUser && currentUser.hasPlatformPrivilege(AuthorizationPrivilege.CreateSpace);

  // TODO: This will not be needed when we have multiple spaces per account and a single account per user
  const accountId = data?.user?.accounts[0]?.id;

  const { spaces, virtualContributors, innovationPacks, innovationHubs } = useMemo(
    () => ({
      spaces: data?.user?.accounts.flatMap(account => account.spaces) ?? [],
      virtualContributors: data?.user?.accounts.flatMap(account => account.virtualContributors) ?? [],
      innovationPacks: data?.user?.accounts.flatMap(account => account.innovationPacks) ?? [],
      innovationHubs: data?.user?.accounts.flatMap(account => account.innovationHubs) ?? [],
    }),
    [data?.user?.accounts]
  );
  const spaceIds = spaces.map(space => space.id);

  const { data: spacesData, loading: spacesLoading } = useAccountSpacesQuery({
    variables: {
      spacesIds: spaceIds,
    },
    skip: !spaces.length,
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
          <Actions>{canCreateSpace && <CreateSpaceDialog />}</Actions>
        </PageContentBlock>
        <PageContentBlock halfWidth>
          <BlockTitle>{t('pages.admin.generic.sections.account.virtualContributors')}</BlockTitle>
          <Gutters disablePadding>
            {loading && <JourneyCardHorizontalSkeleton />}
            {!loading &&
              virtualContributors?.map(vc => (
                <ContributorCardHorizontal profile={vc.profile} url={vc.profile.url} seamless />
              ))}
          </Gutters>
        </PageContentBlock>
        <PageContentBlock halfWidth>
          <BlockTitle>{t('pages.admin.generic.sections.account.innovationPacks')}</BlockTitle>
          {loading && <InnovationPackCardHorizontalSkeleton />}
          {!loading &&
            innovationPacks?.map(pack => <InnovationPackCardHorizontal profile={pack.profile} {...pack.templates} />)}
          <Actions>{isMyProfile && accountId && <CreateInnovationPackDialog accountId={accountId} />}</Actions>
        </PageContentBlock>
        {innovationHubs.length > 0 && (
          <PageContentBlock halfWidth>
            <BlockTitle>{t('pages.admin.generic.sections.account.customHomepages')}</BlockTitle>
            {loading && <InnovationHubCardHorizontalSkeleton />}
            {!loading &&
              innovationHubs?.map(hub => (
                <InnovationHubCardHorizontal
                  profile={hub.profile}
                  spaceListFilter={hub.spaceListFilter}
                  spaceVisibilityFilter={hub.spaceVisibilityFilter}
                />
              ))}
          </PageContentBlock>
        )}
      </PageContentColumn>
    </UserSettingsLayout>
  );
};

export default UserAccountPage;
