import { useRolesOrganizationQuery, useSendMessageToOrganizationMutation } from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  OrganizationInfoFragment,
  RoleSetContributorType,
  SpaceLevel,
  TagsetReservedName,
  RoleName,
} from '@/core/apollo/generated/graphql-schema';
import { useCallback, useMemo } from 'react';
import { ContributorCardSquareProps } from '../../contributor/ContributorCardSquare/ContributorCardSquare';
import { SpaceHostedItem } from '@/domain/space/models/SpaceHostedItem.model';
import { COUNTRIES_BY_CODE } from '@/domain/common/location/countries.constants';
import { SocialNetworkEnum } from '@/domain/shared/components/SocialLinks/models/SocialNetworks';
import useRoleSetManager, { RELEVANT_ROLES } from '@/domain/access/RoleSetManager/useRoleSetManager';
import { useTranslation } from 'react-i18next';
import { useOrganizationContext } from '../hooks/useOrganizationContext';
import { ParseKeys } from 'i18next/typescript/t';

export interface UseOrganizationProvided {
  organization?: OrganizationInfoFragment;
  references: {
    id: string;
    name: string;
    uri: string;
    description?: string;
  }[];
  capabilities: string[];
  keywords: string[];
  associates: ContributorCardSquareProps[];
  contributions: SpaceHostedItem[];
  permissions: {
    canEdit: boolean;
    canReadUsers: boolean;
  };
  website?: string;
  handleSendMessage: (text: string) => Promise<void>;
  loading: boolean;
}

const useOrganizationProvider = (): UseOrganizationProvided => {
  const { organizationId, roleSetId, loading, organization, canReadUsers } = useOrganizationContext();

  const { t } = useTranslation();
  const { usersByRole } = useRoleSetManager({
    roleSetId,
    relevantRoles: RELEVANT_ROLES.Organization,
    contributorTypes: [RoleSetContributorType.User],
    fetchContributors: true,
    skip: !organizationId,
  });
  const usersWithRoles = usersByRole[RoleName.Associate];

  const { data: orgRolesData, loading: orgRolesLoading } = useRolesOrganizationQuery({
    variables: {
      organizationId: organizationId!,
    },
    skip: !organizationId || !canReadUsers,
  });
  const references = useMemo(() => {
    const result = [...(organization?.profile.references ?? [])];
    if (organization?.contactEmail)
      result.push({ id: '_email', name: SocialNetworkEnum.email, uri: organization.contactEmail });
    if (organization?.website)
      result.push({ id: '_website', name: SocialNetworkEnum.website, uri: organization.website });
    return result;
  }, [organization?.profile.references]);

  const keywords = useMemo(
    () =>
      organization?.profile.tagsets?.find(x => x.name.toLowerCase() === TagsetReservedName.Keywords.toLowerCase())
        ?.tags || [],
    [organization]
  );

  const capabilities = useMemo(
    () =>
      organization?.profile.tagsets?.find(x => x.name.toLowerCase() === TagsetReservedName.Capabilities.toLowerCase())
        ?.tags || [],
    [organization]
  );

  const organizationPrivileges = organization?.authorization?.myPrivileges ?? [];

  const permissions = {
    canEdit: organizationPrivileges.includes(AuthorizationPrivilege.Update),
    canReadUsers,
  };

  const associates = useMemo<ContributorCardSquareProps[]>(() => {
    return (
      usersWithRoles?.map<ContributorCardSquareProps>(x => ({
        id: x.id,
        displayName: x.profile.displayName,

        roleName: x.roles.map(role => t(`common.roles.${role}` as ParseKeys)).join(', '),
        avatar: x.profile.avatar?.uri,
        tooltip: {
          city: x.profile.location?.city,
          country: x.profile.location?.country && COUNTRIES_BY_CODE[x.profile.location?.country],
          tags: x.profile.tagsets?.flatMap(x => x.tags) || [],
        },
        url: x.profile.url,
        isContactable: x.isContactable,
        contributorType: RoleSetContributorType.User,
      })) || []
    );
  }, [usersWithRoles]);

  // Return all contributions, filter by role in the view if needed
  const contributions = useMemo(() => {
    const spaceContributions = (orgRolesData?.rolesOrganization?.spaces ?? []).map<SpaceHostedItem>(x => ({
      spaceID: x.id,
      spaceLevel: SpaceLevel.L0,
      id: x.id,
      contributorId: organizationId,
      contributorType: RoleSetContributorType.Organization,
      roles: x.roles,
    }));

    const subspaceContributions =
      orgRolesData?.rolesOrganization?.spaces.flatMap<SpaceHostedItem>(h =>
        h.subspaces.map<SpaceHostedItem>(c => ({
          spaceID: c.id,
          spaceLevel: c.level,
          id: c.id,
          contributorId: organizationId,
          contributorType: RoleSetContributorType.Organization,
          roles: c.roles,
        }))
      ) || [];

    return [...spaceContributions, ...subspaceContributions];
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

  return {
    organization,
    permissions,
    references,
    keywords,
    capabilities,
    associates,
    contributions,
    handleSendMessage,
    loading: loading || orgRolesLoading,
  };
};

export default useOrganizationProvider;
