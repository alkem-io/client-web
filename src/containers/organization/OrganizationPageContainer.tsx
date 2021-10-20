import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { UserCardProps } from '../../components/composite/common/cards/user-card/UserCard';
import { SocialLinkItem } from '../../components/composite/common/SocialLinks/SocialLinks';
import { useOrganization, useUserContext } from '../../hooks';
import { useMembershipOrganizationQuery } from '../../hooks/generated/graphql';
import { COUNTRIES_BY_CODE } from '../../models/constants';
import { KEYWORDS_TAGSET, SKILLS_TAGSET } from '../../models/constants/tagset.constants';
import { Container } from '../../models/container';
import { ContributionItem } from '../../models/entities/contribution';
import { isSocialNetworkSupported, SocialNetworkEnum, toSocialNetworkEnum } from '../../models/enums/SocialNetworks';
import { AuthorizationCredential, Credential, OrganizationInfoFragment } from '../../models/graphql-schema';
import { buildUserProfileUrl } from '../../utils/urlBuilders';

export interface OrganizationContainerEntities {
  organization?: OrganizationInfoFragment;
  socialLinks: SocialLinkItem[];
  links: string[];
  skills: string[];
  keywords: string[];
  associates: UserCardProps[];
  contributions: ContributionItem[];
  permissions: {
    canEdit: boolean;
  };
}

export interface OrganizationContainerActions {}

export interface OrganizationContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface OrganizationPageContainerProps
  extends Container<OrganizationContainerEntities, OrganizationContainerActions, OrganizationContainerState> {}

export const OrganizationPageContainer: FC<OrganizationPageContainerProps> = ({ children }) => {
  const { organizationId, organizationNameId, loading, organization } = useOrganization();

  const { data: membershipData, loading: orgMembershipLoading } = useMembershipOrganizationQuery({
    variables: {
      input: {
        organizationID: organizationNameId,
      },
    },
    skip: !organizationNameId,
  });

  const socialLinks = useMemo(() => {
    const isSocialLink = (item: { type?: string; url: string }): item is SocialLinkItem => !!item?.type;

    const result = (organization?.profile.references || [])
      .map(s => ({
        type: toSocialNetworkEnum(s.name),
        url: s.uri,
      }))
      .filter(isSocialLink);
    if (organization?.contactEmail) result.push({ type: SocialNetworkEnum.email, url: organization?.contactEmail });

    return result;
  }, [organization]);

  const links = useMemo(() => {
    let result = (organization?.profile.references || [])
      .filter(x => !isSocialNetworkSupported(x.name))
      .map(s => s.uri);

    if (organization?.website) result = [organization.website, ...result];

    return result;
  }, [organization]);

  const keywords = useMemo(
    () => organization?.profile.tagsets?.find(x => x.name.toLowerCase() === KEYWORDS_TAGSET)?.tags || [],
    [organization]
  );

  const skills = useMemo(
    () => organization?.profile.tagsets?.find(x => x.name.toLowerCase() === SKILLS_TAGSET)?.tags || [],
    [organization]
  );

  const { user } = useUserContext();

  const permissions = {
    canEdit: useMemo(
      () =>
        user?.hasCredentials(AuthorizationCredential.GlobalAdmin) ||
        user?.hasCredentials(AuthorizationCredential.OrganizationOwner, organizationId) ||
        user?.hasCredentials(AuthorizationCredential.OrganizationAdmin, organizationId) ||
        false,
      [user]
    ),
  };

  const associates = useMemo(() => {
    const toRole = (credentials: Credential[] = []) => {
      let result = 'Member';

      if (
        credentials.findIndex(
          c =>
            (c.type === AuthorizationCredential.OrganizationAdmin && c.resourceID === organizationId) ||
            c.type === AuthorizationCredential.GlobalAdmin
        ) > -1
      ) {
        result = 'Admin';
      }

      if (
        credentials.findIndex(
          c => c.type === AuthorizationCredential.OrganizationOwner && c.resourceID === organizationId
        ) > -1
      ) {
        result = 'Owner';
      }
      return result;
    };

    return (
      organization?.members?.map<UserCardProps>(x => ({
        displayName: x.displayName,
        roleName: toRole(x.agent?.credentials),
        avatarSrc: x.profile?.avatar || '',
        tags: x.profile?.tagsets?.flatMap(x => x.tags) || [],
        url: buildUserProfileUrl(x.nameID),
        city: x.city,
        country: COUNTRIES_BY_CODE[x.country],
      })) || []
    );
  }, [organization]);

  const contributions = useMemo(() => {
    const { ecoversesHosting = [], challengesLeading = [] } = membershipData?.membershipOrganization || {};
    const ecoverseContributions = ecoversesHosting.map<ContributionItem>(x => ({
      ecoverseId: x.id,
    }));

    const challengeContributions = challengesLeading.map<ContributionItem>(x => ({
      ecoverseId: x.ecoverseID,
      challengeId: x.id,
    }));

    return [...ecoverseContributions, ...challengeContributions];
  }, [membershipData]);

  return (
    <>
      {children(
        { organization, permissions, socialLinks, links, keywords, skills, associates, contributions },
        {
          loading: loading || orgMembershipLoading,
        },
        {}
      )}
    </>
  );
};
export default OrganizationPageContainer;
