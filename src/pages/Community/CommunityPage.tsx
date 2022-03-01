import React, { FC, useMemo } from 'react';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { PageProps } from '../common';
import { getUserCardRoleNameKey, useUpdateNavigation, useUserContext } from '../../hooks';
import CommunityPageView, { SearchableUserCardProps } from '../../views/community/CommunityPageView';
import CommunityPageContainer from '../../containers/community/CommunityPageContainer';
import {
  OrganizationCardFragment,
  OrganizationVerificationEnum,
  Scalars,
  User,
  UserCardFragment,
} from '../../models/graphql-schema';
import { OrganizationCardProps } from '../../components/composite/common/cards/Organization/OrganizationCard';
import getActivityCount from '../../utils/get-activity-count';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../utils/urlBuilders';
import { useResolvedPath } from 'react-router-dom';
import { CommunityUpdatesContainer } from '../../containers/community-updates/CommunityUpdatesContainer';
import { AvatarsProvider } from '../../context/AvatarsProvider';

export interface CommunityPageV2Props extends PageProps {
  hubId?: Scalars['UUID_NAMEID'];
  communityId?: Scalars['UUID'];
  challengeId?: Scalars['UUID_NAMEID'];
  opportunityId?: Scalars['UUID'];
}

const CommunityPage: FC<CommunityPageV2Props> = ({ paths, hubId, communityId, challengeId, opportunityId }) => {
  const { t } = useTranslation();

  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'community', real: true }], [paths]);
  useUpdateNavigation({ currentPaths });

  const { user: userMetadata } = useUserContext();
  const user = userMetadata?.user;

  const resourceId = opportunityId ?? challengeId ?? hubId;

  return (
    <CommunityUpdatesContainer entities={{ hubId, communityId }}>
      {({ messages, senders }, actions, loading) => (
        <CommunityPageContainer
          hubId={hubId}
          communityId={communityId}
          challengeId={challengeId}
          opportunityId={opportunityId}
        >
          {(entities, state) => {
            const hostOrganization =
              entities.hostOrganization &&
              user &&
              toOrganizationCardProps(entities.hostOrganization, entities.hostOrganization.id, user, t);
            const leadingOrganizations =
              user && entities.leadingOrganizations.map(x => toOrganizationCardProps(x, x.id, user, t));
            const members = toUserCardProps(entities.members, resourceId, t);
            return (
              <AvatarsProvider users={senders}>
                {populatedUsers => (
                  <CommunityPageView
                    title={entities?.communityName}
                    loading={state.loading}
                    showOrganizations={!opportunityId}
                    hostOrganization={hostOrganization}
                    leadingOrganizations={leadingOrganizations}
                    organizationsLoading={state.organizationsLoading}
                    members={members}
                    membersLoading={state.membersLoading}
                    messages={messages}
                    messagesLoading={loading.retrievingUpdateMessages}
                    authors={populatedUsers}
                  />
                )}
              </AvatarsProvider>
            );
          }}
        </CommunityPageContainer>
      )}
    </CommunityUpdatesContainer>
  );
};
export default CommunityPage;

const toOrganizationCardProps = (
  data: OrganizationCardFragment,
  resourceId = '',
  user: User,
  t: TFunction
): OrganizationCardProps => ({
  verified: data.verification.status === OrganizationVerificationEnum.VerifiedManualAttestation,
  information: data.profile.description,
  name: data.displayName,
  avatar: data.profile.avatar?.uri,
  members: getActivityCount(data.activity ?? [], 'members') ?? 0,
  role: t(getUserCardRoleNameKey([user], resourceId)[0].roleNameKey),
  url: buildOrganizationUrl(data.nameID),
});

const toUserCardProps = (data: UserCardFragment[], resourceId = '', t: TFunction): SearchableUserCardProps[] => {
  const users = getUserCardRoleNameKey(data, resourceId);

  return users.map(
    ({ roleNameKey, ...x }) =>
      ({
        id: x.id,
        roleName: t(roleNameKey),
        tags: x?.profile?.tagsets?.flatMap(x => x.tags),
        displayName: x.displayName,
        avatarSrc: x?.profile?.avatar?.uri,
        city: x.city,
        country: x.country,
        url: buildUserProfileUrl(x.nameID),
      } as SearchableUserCardProps)
  );
};
