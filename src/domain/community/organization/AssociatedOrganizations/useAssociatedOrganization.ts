import {
  refetchUserOrganizationIdsQuery,
  useAssociatedOrganizationQuery,
  useRemoveRoleFromUserMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { type AssociatedOrganization, mapToAssociatedOrganization } from './AssociatedOrganization';

type UseAssociatedOrganizationParams = {
  organizationId: string;
  enableLeave?: boolean;
};

type UseAssociatedOrganizationResult = AssociatedOrganization & {
  handleRemoveSelfFromOrganization: () => void;
  removingFromOrganization?: boolean;
  enableLeave?: boolean;
};

const useAssociatedOrganization = ({
  organizationId,
  enableLeave,
}: UseAssociatedOrganizationParams): UseAssociatedOrganizationResult => {
  const { userModel } = useCurrentUserContext();
  const userId = userModel?.id;

  const { data, loading, error } = useAssociatedOrganizationQuery({
    variables: {
      organizationId,
    },
    errorPolicy: 'all',
  });
  const roleSetId = data?.lookup.organization?.roleSet.id;

  const [disassociateSelfFromOrganization, { loading: removingFromOrganization }] = useRemoveRoleFromUserMutation();
  const handleRemoveSelfFromOrganization = async () => {
    if (!userId || !roleSetId) {
      throw new Error('Data not yet loaded');
    }

    await disassociateSelfFromOrganization({
      variables: {
        contributorId: userId,
        roleSetId,
        role: RoleName.Associate,
      },
      refetchQueries: [refetchUserOrganizationIdsQuery({ userId })],
      awaitRefetchQueries: true,
    });
  };

  const associatedOrganization = mapToAssociatedOrganization(data?.lookup.organization, organizationId, {
    loading,
    error,
  });

  return {
    ...associatedOrganization,
    handleRemoveSelfFromOrganization,
    removingFromOrganization,
    enableLeave,
  };
};

export default useAssociatedOrganization;
