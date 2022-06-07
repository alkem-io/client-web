import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { ContributorCardProps } from '../../components/composite/common/cards/ContributorCard/ContributorCard';
import { isSocialLink, SocialLinkItem } from '../../components/composite/common/SocialLinks/SocialLinks';
import { useOrganization, useUserCardRoleName, useUserContext } from '../../hooks';
import { useRolesOrganizationQuery } from '../../hooks/generated/graphql';
import { COUNTRIES_BY_CODE, RoleType } from '../../models/constants';
import { CAPABILITIES_TAGSET, KEYWORDS_TAGSET } from '../../models/constants/tagset.constants';
import { ContainerChildProps } from '../../models/container';
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
  associates: ContributorCardProps[];
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
  extends ContainerChildProps<
    OrganizationContainerEntities,
    OrganizationContainerActions,
    OrganizationContainerState
  > {}

export const OrganizationPageContainer: FC<OrganizationPageContainerProps> = ({ children }) => {
  const { organizationId, organizationNameId, loading, organization } = useOrganization();

  const usersWithRoles = useUserCardRoleName((organization?.members || []) as User[], organizationId);

  const { data: membershipData, loading: orgMembershipLoading } = useRolesOrganizationQuery({
    variables: {
      input: {
        organizationID: organizationNameId,
      },
    },
    skip: !organizationNameId,
  });

  const socialLinks = useMemo(() => {
    const result = (organization?.profile.references || [])
      .map(s => ({
        type: toSocialNetworkEnum(s.name),
        url: s.uri,
      }))
      .filter(isSocialLink);
    if (organization?.contactEmail) result.push({ type: SocialNetworkEnum.email, url: organization?.contactEmail });
    if (organization?.website) result.push({ type: SocialNetworkEnum.website, url: organization?.website });

    return result;
  }, [organization]);

  const links = useMemo(() => {
    let result = (organization?.profile.references || [])
      .filter(x => !isSocialNetworkSupported(x.name))
      .map(s => s.uri);

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

  const associates = useMemo<ContributorCardProps[]>(() => {
    return (
      usersWithRoles.map<ContributorCardProps>(x => ({
        displayName: x.displayName,
        roleName: x.roleName,
        avatar: x.profile?.avatar?.uri || '',
        tooltip: {
          city: x.profile?.location?.city || '',
          country: x.profile?.location?.country && COUNTRIES_BY_CODE[x.profile?.location?.country],
          tags: x.profile?.tagsets?.flatMap(x => x.tags) || [],
        },
        url: buildUserProfileUrl(x.nameID),
      })) || []
    );
  }, [usersWithRoles]);

  const contributions = useMemo(() => {
    const hubsHosting = membershipData?.rolesOrganization?.hubs?.filter(h => h.roles?.includes(RoleType.Host)) || [];

    const hubContributions = hubsHosting.map<ContributionItem>(x => ({
      hubId: x.id,
    }));

    // Loop over hubs, filter the challenges in which user has the role 'lead' and map those challenges to ContributionItems
    const challengeContributions =
      membershipData?.rolesOrganization?.hubs.flatMap<ContributionItem>(h =>
        h.challenges
          .filter(c => c.roles?.includes(RoleType.Lead))
          .map<ContributionItem>(c => ({
            hubId: h.id,
            challengeId: c.id,
          }))
      ) || [];

    return [...hubContributions, ...challengeContributions];
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
