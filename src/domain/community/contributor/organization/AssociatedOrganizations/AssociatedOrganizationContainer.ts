import { FC, useCallback } from 'react';
import { useUserContext } from '../../../user';
import {
  refetchUserOrganizationIdsQuery,
  useAssociatedOrganizationQuery,
  useRemoveUserFromOrganizationMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import {
  ContainerPropsWithProvided,
  renderComponentOrChildrenFn,
} from '../../../../../core/container/ComponentOrChildrenFn';
import { AssociatedOrganization, mapToAssociatedOrganization } from './AssociatedOrganization';

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

export const AssociatedOrganizationContainer: FC<OrganizationDetailsContainerProps> = ({
  organizationId,
  enableLeave,
  ...rendered
}) => {
  const { user } = useUserContext();

  const { data, loading, error } = useAssociatedOrganizationQuery({
    variables: {
      organizationId,
    },
    errorPolicy: 'all',
  });

  const [disassociateSelfFromOrganization, { loading: removingFromOrganization }] =
    useRemoveUserFromOrganizationMutation();

  const handleRemoveSelfFromOrganization = useCallback(async () => {
    if (!user) {
      throw new Error('User is not loaded');
    }

    await disassociateSelfFromOrganization({
      variables: {
        input: {
          userID: user.user.id,
          organizationID: organizationId,
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
