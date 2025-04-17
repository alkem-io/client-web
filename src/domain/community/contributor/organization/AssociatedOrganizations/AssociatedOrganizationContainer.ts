import { useCallback } from 'react';
import { useCurrentUserContext } from '@/domain/community/user';
import {
  refetchUserOrganizationIdsQuery,
  useAssociatedOrganizationQuery,
  useRemoveRoleFromUserMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { ContainerPropsWithProvided, renderComponentOrChildrenFn } from '@/core/container/ComponentOrChildrenFn';
import { AssociatedOrganization, mapToAssociatedOrganization } from './AssociatedOrganization';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

export type OrganizationDetailsContainerProps = ContainerPropsWithProvided<
  {
    organizationId: string;
    enableLeave?: boolean;
  },
  AssociatedOrganization & {
    handleRemoveSelfFromOrganization: () => void;
    removingFromOrganization?: boolean;
  }
>;

export const AssociatedOrganizationContainer = ({
  organizationId,
  enableLeave,
  ...rendered
}: OrganizationDetailsContainerProps) => {
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
  const handleRemoveSelfFromOrganization = useCallback(async () => {
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
  }, [organizationId, userId, roleSetId, disassociateSelfFromOrganization]);

  const associatedOrganization = mapToAssociatedOrganization(data?.lookup.organization, organizationId, {
    loading,
    error,
  });

  return renderComponentOrChildrenFn(rendered, {
    ...associatedOrganization,
    handleRemoveSelfFromOrganization,
    removingFromOrganization,
    enableLeave,
  });
};

export default AssociatedOrganizationContainer;
