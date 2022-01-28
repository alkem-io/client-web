import Box from '@mui/material/Box';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserCardProps } from '../../components/composite/common/cards';
import { OrganizationCardProps } from '../../components/composite/common/cards/Organization/OrganizationCard';
import SearchComponent from '../../components/composite/common/SearchComponent/SearchComponent';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import ContributorsSearchContainer from '../../containers/ContributorsSearch/ContributorsSearchContainer';
import { useUpdateNavigation, useUserContext } from '../../hooks';
import { OrganizationVerificationEnum, UserContributorFragment } from '../../models/graphql-schema';
import getActivityCount from '../../utils/get-activity-count';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../utils/urlBuilders';
import getUserRoleTranslationKey from '../../utils/user-role-name/get-user-role-translation-key';
import ContributorsView from '../../views/Contributors/ContributorsView';

export interface ContributorsPageProps {}

const currentPaths = [];
const ContributorsPage: FC<ContributorsPageProps> = () => {
  const { t } = useTranslation();

  useUpdateNavigation({ currentPaths });
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
            const roleTranslationKey = getUserRoleTranslationKey(x.id, userAgent);
            const roleName = roleTranslationKey ? t(roleTranslationKey) : undefined;
            return {
              name: x.displayName,
              avatar: x.orgProfile.avatar?.uri,
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
    avatarSrc: x.userProfile?.avatar?.uri ?? '',
    displayName: x.displayName,
    tags: (x.userProfile?.tagsets || []).flatMap(y => y.tags),
    url: buildUserProfileUrl(x.nameID),
    city: x.city,
    country: x.country,
    loading,
  }));
};
