import React, { FC } from 'react';
import { PageProps } from '../common';
import { useChallenge } from '../../hooks';
import CommunityPage from './CommunityPage';
import { useChallengeCommunityPageCommunityMembersQuery } from '../../hooks/generated/graphql';
import CommunityContributors from '../../domain/community/CommunityContributors/CommunityContributors';
import { useTranslation } from 'react-i18next';
import useOrganizationCardProps from '../../domain/community/utils/useOrganizationCardProps';
import useUserCardProps from '../../domain/community/utils/useUserCardProps';
import { SectionSpacer } from '../../components/core/Section/Section';

const ChallengeCommunityPage: FC<PageProps> = ({ paths }) => {
  const { challenge, hubId } = useChallenge();
  const communityId = challenge?.community?.id;
  const challengeId = challenge?.id;

  const { data } = useChallengeCommunityPageCommunityMembersQuery({
    variables: {
      hubId,
      challengeId: challengeId!,
    },
    skip: !hubId || !challengeId,
  });

  const { leadUsers, memberUsers, leadOrganizations, memberOrganizations } = data?.hub.challenge.community ?? {};

  const { t } = useTranslation();

  return (
    <CommunityPage entityTypeName="challenge" paths={paths} hubId={hubId} communityId={communityId}>
      <SectionSpacer />
      <CommunityContributors
        title={t('pages.generic.sections.community.leading-contributors')}
        ariaKey="leading-contributors"
        organizations={useOrganizationCardProps(leadOrganizations)}
        users={useUserCardProps(leadUsers, challengeId)}
        organizationsCount={leadOrganizations?.length}
        usersCount={leadUsers?.length}
      />
      <CommunityContributors
        title={t('pages.generic.sections.community.contributors')}
        ariaKey="contributors"
        organizations={useOrganizationCardProps(memberOrganizations)}
        users={useUserCardProps(memberUsers, challengeId)}
        organizationsCount={memberOrganizations?.length}
        usersCount={memberUsers?.length}
      />
    </CommunityPage>
  );
};

export default ChallengeCommunityPage;
