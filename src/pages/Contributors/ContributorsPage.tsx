import Box from '@mui/material/Box';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserCardProps } from '../../common/components/composite/common/cards';
import { OrganizationCardProps } from '../../common/components/composite/common/cards/Organization/OrganizationCard';
import SearchTagsInput from '../../domain/shared/components/SearchTagsInput/SearchTagsInput';
import DashboardGenericSection from '../../domain/shared/components/DashboardSections/DashboardGenericSection';
import ContributorsSearchContainer from '../../containers/ContributorsSearch/ContributorsSearchContainer';
import { useUpdateNavigation, useUserContext } from '../../hooks';
import { OrganizationVerificationEnum, UserContributorFragment } from '../../models/graphql-schema';
import getActivityCount from '../../domain/activity/utils/getActivityCount';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../common/utils/urlBuilders';
import getUserRoleTranslationKey from '../../common/utils/user-role-name/get-user-role-translation-key';
import ContributorsView from '../../views/Contributors/ContributorsView';

export interface ContributorsPageProps {}

const currentPaths = [];
const ContributorsPage: FC<ContributorsPageProps> = () => {
  const { t } = useTranslation();

  useUpdateNavigation({ currentPaths });
  const [searchTerms, setSearchTerms] = useState<string[]>([]);

  const { isAuthenticated, user: userMetadata } = useUserContext();
  const userAgent = userMetadata?.user.agent;

  const onSearchHandler = (_e: unknown, terms: string[]) => setSearchTerms(terms);

  return (
    <Box paddingY={2}>
      <DashboardGenericSection
        headerText={t('pages.contributors.search.title')}
        subHeaderText={t('pages.contributors.search.subtitle')}
      >
        <SearchTagsInput
          value={searchTerms}
          placeholder={t('pages.contributors.search.placeholder')}
          onChange={onSearchHandler}
        />
      </DashboardGenericSection>
      <ContributorsSearchContainer terms={searchTerms}>
        {({ users, organizations }, state) => {
          const orgModels: OrganizationCardProps[] = organizations.map(x => {
            const roleTranslationKey = getUserRoleTranslationKey(x.id, userAgent);
            const roleName = roleTranslationKey ? t(roleTranslationKey) : undefined;
            return {
              name: x.displayName,
              avatar: x.orgProfile.avatar?.uri,
              description: x.orgProfile.description,
              role: roleName as string,
              membersCount: getActivityCount(x.activity ?? [], 'members'),
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
    city: x.userProfile?.location?.city || '',
    country: x.userProfile?.location?.country || '',
    loading,
  }));
};
