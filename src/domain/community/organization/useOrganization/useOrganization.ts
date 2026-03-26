import type { ParseKeys } from 'i18next/typescript/t';
import { useTranslation } from 'react-i18next';
import { useRolesOrganizationQuery, useSendMessageToOrganizationMutation } from '@/core/apollo/generated/apollo-hooks';
import {
  ActorType,
  AuthorizationPrivilege,
  type OrganizationInfoFragment,
  RoleName,
  SpaceLevel,
  TagsetReservedName,
} from '@/core/apollo/generated/graphql-schema';
import useRoleSetManager, { RELEVANT_ROLES } from '@/domain/access/RoleSetManager/useRoleSetManager';
import { COUNTRIES_BY_CODE } from '@/domain/common/location/countries.constants';
import { SocialNetworkEnum } from '@/domain/shared/components/SocialLinks/models/SocialNetworks';
import type { SpaceHostedItem } from '@/domain/space/models/SpaceHostedItem.model';
import type { ContributorCardSquareProps } from '../../contributor/ContributorCardSquare/ContributorCardSquare';
import { useOrganizationContext } from '../hooks/useOrganizationContext';

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
    contributorTypes: [ActorType.User],
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
  const references = (() => {
    const result = [...(organization?.profile?.references ?? [])];
    if (organization?.contactEmail)
      result.push({ id: '_email', name: SocialNetworkEnum.email, uri: organization.contactEmail });
    if (organization?.website)
      result.push({ id: '_website', name: SocialNetworkEnum.website, uri: organization.website });
    return result;
  })();

  const keywords =
    organization?.profile?.tagsets?.find(x => x.name.toLowerCase() === TagsetReservedName.Keywords.toLowerCase())
      ?.tags || [];

  const capabilities =
    organization?.profile?.tagsets?.find(x => x.name.toLowerCase() === TagsetReservedName.Capabilities.toLowerCase())
      ?.tags || [];

  const organizationPrivileges = organization?.authorization?.myPrivileges ?? [];

  const permissions = {
    canEdit: organizationPrivileges.includes(AuthorizationPrivilege.Update),
    canReadUsers,
  };

  const associates = (() => {
    return (
      usersWithRoles?.map<ContributorCardSquareProps>(x => ({
        id: x.id,
        displayName: x.profile?.displayName ?? '',

        roleName: x.roles.map(role => t(`common.roles.${role}` as ParseKeys)).join(', '),
        avatar: x.profile?.avatar?.uri,
        tooltip: {
          city: x.profile?.location?.city,
          country: x.profile?.location?.country && COUNTRIES_BY_CODE[x.profile.location?.country],
          tags: x.profile?.tagsets?.flatMap(x => x.tags) || [],
        },
        url: x.profile?.url ?? '',
        isContactable: x.isContactable,
        contributorType: ActorType.User,
      })) || []
    );
  })();

  // Return all contributions, filter by role in the view if needed
  const contributions = (() => {
    const spaceContributions = (orgRolesData?.rolesOrganization?.spaces ?? []).map<SpaceHostedItem>(x => ({
      spaceID: x.id,
      spaceLevel: SpaceLevel.L0,
      id: x.id,
      contributorId: organizationId,
      contributorType: ActorType.Organization,
      roles: x.roles,
    }));

    const subspaceContributions =
      orgRolesData?.rolesOrganization?.spaces.flatMap<SpaceHostedItem>(h =>
        h.subspaces.map<SpaceHostedItem>(c => ({
          spaceID: c.id,
          spaceLevel: c.level,
          id: c.id,
          contributorId: organizationId,
          contributorType: ActorType.Organization,
          roles: c.roles,
        }))
      ) || [];

    return [...spaceContributions, ...subspaceContributions];
  })();

  const [sendMessageToOrganization] = useSendMessageToOrganizationMutation();
  const handleSendMessage = async (messageText: string) => {
    await sendMessageToOrganization({
      variables: {
        messageData: {
          message: messageText,
          organizationId: organizationId,
        },
      },
    });
  };

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
