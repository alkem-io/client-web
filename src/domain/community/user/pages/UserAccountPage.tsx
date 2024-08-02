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

interface UserAccountPageProps {}

export const UserAccountPage: FC<UserAccountPageProps> = () => {
  const { t } = useTranslation();
  const { data, loading } = useUserAccountQuery();

  const { spaceIds, virtualContributors, innovationPacks, innovationHubs } = useMemo(
    () => ({
      spaceIds: data?.me.user?.accounts.flatMap(account => account.spaceID),
      virtualContributors: data?.me.user?.accounts.flatMap(account => account.virtualContributors),
      innovationPacks: data?.me.user?.accounts.flatMap(account => account.innovationPacks),
      innovationHubs: data?.me.user?.accounts.flatMap(account => account.innovationHubs),
    }),
    [data?.me.user?.accounts]
  );

  const { data: spacesData, loading: spacesLoading } = useAccountSpacesQuery({
    variables: {
      spacesIds: spaceIds,
    },
    skip: !spaceIds?.length,
  });
  //     <StorageConfigContextProvider locationType="user" userId={data?.me.user?.id}>

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
        {innovationPacks?.length && (
          <PageContentBlock halfWidth>
            <BlockTitle>{t('pages.admin.generic.sections.account.innovationPacks')}</BlockTitle>
            {loading && <InnovationPackCardHorizontalSkeleton />}
            {!loading &&
              innovationPacks?.map(ip => <InnovationPackCardHorizontal profile={ip.profile} {...ip.templates} />)}
          </PageContentBlock>
        )}
        {innovationHubs?.length && (
          <PageContentBlock halfWidth>
            <BlockTitle>{t('pages.admin.generic.sections.account.customHomepages')}</BlockTitle>
            {loading && <InnovationHubCardHorizontalSkeleton />}
            {!loading &&
              innovationHubs?.map(ih => (
                <InnovationHubCardHorizontal
                  profile={ih.profile}
                  spaceListFilter={ih.spaceListFilter}
                  spaceVisibilityFilter={ih.spaceVisibilityFilter}
                />
              ))}
          </PageContentBlock>
        )}
      </PageContentColumn>
    </UserSettingsLayout>
  );
};

export default UserAccountPage;
