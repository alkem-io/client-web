import React, { FC, useState } from 'react';
import Box from '@mui/material/Box';
import ContributorsView from '../../views/Contributors/ContributorsView';
import { useUserContext } from '../../hooks';
import ContributorsSearchContainer from '../../containers/ContributorsSearch/ContributorsSearchContainer';
import { OrganizationVerificationEnum, UserContributorFragment } from '../../models/graphql-schema';
import { UserCardProps } from '../../components/composite/common/cards';
import { OrganizationCardProps } from '../../components/composite/common/cards/Organization/OrganizationCard';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import SearchComponent from '../../components/composite/common/SearchComponent/SearchComponent';
import { useTranslation } from 'react-i18next';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../utils/urlBuilders';
import getActivityCount from '../../utils/get-activity-count';
import getUserRoleName from '../../utils/user-role-name/get-user-role-name';

export interface ContributorsPageProps {}

const ContributorsPage: FC<ContributorsPageProps> = () => {
  const { t } = useTranslation();
  const [searchTerms, setSearchTerms] = useState<string[]>([]);

  const { isAuthenticated, user: userMetadata } = useUserContext();
  const userAgent = userMetadata?.user.agent;

  const onSearchHandler = (terms: string[]) => setSearchTerms(terms);

  return (
    <Box paddingY={2}>
      <DashboardGenericSection
        headerText={t('pages.contributors.search.title')}
        subHeaderText={t('pages.contributors.search.subtitle')}
      >
        <SearchComponent placeholder={t('pages.contributors.search.placeholder')} onChange={onSearchHandler}>
          {() => null}
        </SearchComponent>
      </DashboardGenericSection>
      <ContributorsSearchContainer terms={searchTerms}>
        {({ users, organizations }, state) => {
          const orgModels: OrganizationCardProps[] = organizations.map(x => {
            const roleTranslationKey = getUserRoleName(x.id, userAgent)?.key;
            const roleName = roleTranslationKey ? t(roleTranslationKey) : undefined;
            return {
              name: x.displayName,
              avatar: x.orgProfile.avatar,
              information: x.orgProfile.description,
              role: roleName as string,
              members: getActivityCount(x.activity ?? [], 'members') ?? 0,
              verified: x.verification.status === OrganizationVerificationEnum.VerifiedManualAttestation,
              url: buildOrganizationUrl(x.nameID),
              loading: state.loading,
            };
          });

          return (
            <ContributorsView
              users={toUserCardViewmodel(users, state.loading)}
              showUsers={isAuthenticated}
              organizations={orgModels}
              loading={state.loading}
              error={state.error}
            />
          );
        }}
      </ContributorsSearchContainer>
    </Box>
  );
};
export default ContributorsPage;

const toUserCardViewmodel = (users: UserContributorFragment[], loading: boolean): UserCardProps[] => {
  return users.map(x => ({
    avatarSrc: x.userProfile?.avatar ?? '',
    displayName: x.displayName,
    tags: (x.userProfile?.tagsets || []).flatMap(y => y.tags),
    url: buildUserProfileUrl(x.nameID),
    city: x.city,
    country: x.country,
    loading,
  }));
};
