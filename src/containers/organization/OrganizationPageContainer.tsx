import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { UserCardProps } from '../../components/composite/common/cards/user-card/UserCard';
import { SocialLinkItem } from '../../components/composite/common/SocialLinks/SocialLinks';
import { useOrganization, useUserCardRoleName, useUserContext } from '../../hooks';
import { useMembershipOrganizationQuery } from '../../hooks/generated/graphql';
import { COUNTRIES_BY_CODE } from '../../models/constants';
import { CAPABILITIES_TAGSET, KEYWORDS_TAGSET } from '../../models/constants/tagset.constants';
import { Container } from '../../models/container';
import { ContributionItem } from '../../models/entities/contribution';
import { isSocialNetworkSupported, SocialNetworkEnum, toSocialNetworkEnum } from '../../models/enums/SocialNetworks';
import { AuthorizationCredential, OrganizationInfoFragment, User } from '../../models/graphql-schema';
import { buildUserProfileUrl } from '../../utils/urlBuilders';

export interface OrganizationContainerEntities {
  organization?: OrganizationInfoFragment;
  socialLinks: SocialLinkItem[];
  links: string[];
  capabilities: string[];
  keywords: string[];
  associates: UserCardProps[];
  contributions: ContributionItem[];
  permissions: {
    canEdit: boolean;
  };
  website?: string;
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

  const usersWithRoles = useUserCardRoleName((organization?.members || []) as User[], organizationId);

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
    if (organization?.domain) result.push({ type: SocialNetworkEnum.website, url: organization?.domain });

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

  const capabilities = useMemo(
    () => organization?.profile.tagsets?.find(x => x.name.toLowerCase() === CAPABILITIES_TAGSET)?.tags || [],
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
    return (
      usersWithRoles.map<UserCardProps>(x => ({
        displayName: x.displayName,
        roleName: x.roleName,
        avatarSrc: x.profile?.avatar || '',
        tags: x.profile?.tagsets?.flatMap(x => x.tags) || [],
        url: buildUserProfileUrl(x.nameID),
        city: x.city,
        country: COUNTRIES_BY_CODE[x.country],
      })) || []
    );
  }, [usersWithRoles]);

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
        { organization, permissions, socialLinks, links, keywords, capabilities, associates, contributions },
        {
          loading: loading || orgMembershipLoading,
        },
        {}
      )}
    </>
  );
};
export default OrganizationPageContainer;
