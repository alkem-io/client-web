import { useCallback } from 'react';
import { useUserContext } from '@/domain/community/user';
import {
  refetchUserOrganizationIdsQuery,
  useAssociatedOrganizationQuery,
  useRemoveOrganizationRoleFromUserMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { ContainerPropsWithProvided, renderComponentOrChildrenFn } from '@/core/container/ComponentOrChildrenFn';
import { AssociatedOrganization, mapToAssociatedOrganization } from './AssociatedOrganization';
import { OrganizationRole } from '@/core/apollo/generated/graphql-schema';

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
  const { user } = useUserContext();

  const { data, loading, error } = useAssociatedOrganizationQuery({
    variables: {
      organizationId,
    },
    errorPolicy: 'all',
  });

  const [disassociateSelfFromOrganization, { loading: removingFromOrganization }] =
    useRemoveOrganizationRoleFromUserMutation();

  const handleRemoveSelfFromOrganization = useCallback(async () => {
    if (!user) {
      throw new Error('User is not loaded');
    }

    await disassociateSelfFromOrganization({
      variables: {
        input: {
          userID: user.user.id,
          organizationID: organizationId,
          role: OrganizationRole.Associate,
        },
      },
      refetchQueries: [refetchUserOrganizationIdsQuery({ userId: user.user.id })],
      awaitRefetchQueries: true,
    });
  }, [user?.user.id, organizationId, disassociateSelfFromOrganization]);

  const associatedOrganization = mapToAssociatedOrganization(data?.organization, organizationId, {
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
