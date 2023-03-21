import { ApolloError } from '@apollo/client';
import React, { FC, useCallback, useMemo } from 'react';
import { ContributorCardProps } from '../../../../../common/components/composite/common/cards/ContributorCard/ContributorCard';
import { isSocialLink, SocialLinkItem } from '../../../../shared/components/SocialLinks/SocialLinks';
import { RoleType } from '../../user/constants/RoleType';
import { useOrganization } from '../hooks/useOrganization';
import useUserCardRoleName from '../../user/hooks/useUserCardRoleName';
import {
  useRolesOrganizationQuery,
  useSendMessageToOrganizationMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { COUNTRIES_BY_CODE } from '../../../../common/location/countries.constants';
import { CAPABILITIES_TAGSET, KEYWORDS_TAGSET } from '../../../../common/tags/tagset.constants';
import { ContainerChildProps } from '../../../../../core/container/container';
import { ContributionItem } from '../../contribution';
import {
  isSocialNetworkSupported,
  SocialNetworkEnum,
  toSocialNetworkEnum,
} from '../../../../shared/components/SocialLinks/models/SocialNetworks';
import {
  AuthorizationPrivilege,
  OrganizationInfoFragment,
  User,
} from '../../../../../core/apollo/generated/graphql-schema';
import { buildUserProfileUrl } from '../../../../../common/utils/urlBuilders';

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
    canReadUsers: boolean;
  };
  website?: string;
  handleSendMessage: (text: string) => Promise<void>;
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

const NO_PRIVILEGES = [];

export const OrganizationPageContainer: FC<OrganizationPageContainerProps> = ({ children }) => {
  const { organizationId, organizationNameId, loading, organization, canReadUsers } = useOrganization();

  const usersWithRoles = useUserCardRoleName((organization?.associates || []) as User[], organizationId);

  const { data: orgRolesData, loading: orgRolesLoading } = useRolesOrganizationQuery({
    variables: {
      input: organizationNameId,
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

  const organizationPrivileges = organization?.authorization?.myPrivileges ?? NO_PRIVILEGES;

  const permissions = {
    canEdit: organizationPrivileges.includes(AuthorizationPrivilege.Update),
    canReadUsers,
  };

  const associates = useMemo<ContributorCardProps[]>(() => {
    return (
      usersWithRoles.map<ContributorCardProps>(x => ({
        id: x.id,
        displayName: x.profile.displayName,
        roleName: x.roleName,
        avatar: x.profile.visual?.uri || '',
        tooltip: {
          city: x.profile.location?.city || '',
          country: x.profile.location?.country && COUNTRIES_BY_CODE[x.profile.location?.country],
          tags: x.profile.tagsets?.flatMap(x => x.tags) || [],
        },
        url: buildUserProfileUrl(x.nameID),
        isContactable: x.isContactable,
      })) || []
    );
  }, [usersWithRoles]);

  const contributions = useMemo(() => {
    const hubsHosting = orgRolesData?.rolesOrganization?.hubs?.filter(h => h.roles?.includes(RoleType.Host)) || [];

    const hubContributions = hubsHosting.map<ContributionItem>(x => ({
      hubId: x.id,
    }));

    // Loop over hubs, filter the challenges in which user has the role 'lead' and map those challenges to ContributionItems
    const challengeContributions =
      orgRolesData?.rolesOrganization?.hubs.flatMap<ContributionItem>(h =>
        h.challenges
          .filter(c => c.roles?.includes(RoleType.Lead))
          .map<ContributionItem>(c => ({
            hubId: h.id,
            challengeId: c.id,
          }))
      ) || [];

    return [...hubContributions, ...challengeContributions];
  }, [orgRolesData]);

  const [sendMessageToOrganization] = useSendMessageToOrganizationMutation();
  const handleSendMessage = useCallback(
    async (messageText: string) => {
      await sendMessageToOrganization({
        variables: {
          messageData: {
            message: messageText,
            organizationId: organizationId,
          },
        },
      });
    },
    [sendMessageToOrganization, organizationId]
  );
  return (
    <>
      {children(
        {
          organization,
          permissions,
          socialLinks,
          links,
          keywords,
          capabilities,
          associates,
          contributions,
          handleSendMessage,
        },
        {
          loading: loading || orgRolesLoading,
        },
        {}
      )}
    </>
  );
};

export default OrganizationPageContainer;
