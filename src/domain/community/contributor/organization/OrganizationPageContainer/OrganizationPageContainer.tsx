import { ApolloError } from '@apollo/client';
import React, { FC, useCallback, useMemo } from 'react';
import { ContributorCardSquareProps } from '../../ContributorCardSquare/ContributorCardSquare';
import { isSocialLink, SocialLinkItem } from '../../../../shared/components/SocialLinks/SocialLinks';
import { RoleType } from '../../user/constants/RoleType';
import { useOrganization } from '../hooks/useOrganization';
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
import { AuthorizationPrivilege, OrganizationInfoFragment } from '../../../../../core/apollo/generated/graphql-schema';
import { buildUserProfileUrl } from '../../../../../common/utils/urlBuilders';
import { useTranslation } from 'react-i18next';
import {
  ADMIN_TRANSLATION_KEY,
  MEMBER_TRANSLATION_KEY,
  OWNER_TRANSLATION_KEY,
} from '../../user/constants/translation.constants';

export interface OrganizationContainerEntities {
  organization?: OrganizationInfoFragment;
  socialLinks: SocialLinkItem[];
  links: string[];
  capabilities: string[];
  keywords: string[];
  associates: ContributorCardSquareProps[];
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

const roleChecks = [
  {
    collection: 'owners',
    translation: OWNER_TRANSLATION_KEY,
  },
  {
    collection: 'admins',
    translation: ADMIN_TRANSLATION_KEY,
  },
] as const;

export const OrganizationPageContainer: FC<OrganizationPageContainerProps> = ({ children }) => {
  const { organizationId, organizationNameId, loading, organization, canReadUsers } = useOrganization();

  const { t } = useTranslation();

  const usersWithRoles = organization?.associates?.map(user => {
    const roleType =
      roleChecks.find(({ collection }) => {
        return organization[collection]?.some(u => u.id === user.id);
      })?.translation ?? MEMBER_TRANSLATION_KEY;

    return {
      ...user,
      roleName: t(roleType),
    };
  });

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
    return (organization?.profile.references ?? []).filter(x => !isSocialNetworkSupported(x.name)).map(s => s.uri);
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

  const associates = useMemo<ContributorCardSquareProps[]>(() => {
    return (
      usersWithRoles?.map<ContributorCardSquareProps>(x => ({
        id: x.id,
        displayName: x.profile.displayName,
        roleName: x.roleName,
        avatar: x.profile.visual?.uri || '',
        avatarAltText: x.profile.visual?.alternativeText,
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
    const spacesHosting = orgRolesData?.rolesOrganization?.spaces?.filter(h => h.roles?.includes(RoleType.Host)) || [];

    const spaceContributions = spacesHosting.map<ContributionItem>(x => ({
      spaceId: x.id,
      id: x.id,
    }));

    // Loop over spaces, filter the challenges in which user has the role 'lead' and map those challenges to ContributionItems
    const challengeContributions =
      orgRolesData?.rolesOrganization?.spaces.flatMap<ContributionItem>(h =>
        h.challenges
          .filter(c => c.roles?.includes(RoleType.Lead))
          .map<ContributionItem>(c => ({
            spaceId: h.id,
            challengeId: c.id,
            id: c.id,
          }))
      ) || [];

    return [...spaceContributions, ...challengeContributions];
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
