import { FC, useCallback } from 'react';
import { useUserContext } from '../../../user';
import {
  refetchUserOrganizationsQuery,
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
    organizationNameId: string;
    enableLeave?: boolean;
  },
  AssociatedOrganization & {
    handleRemoveSelfFromOrganization: () => void;
    removingFromOrganization?: boolean;
  }
>;

export const AssociatedOrganizationContainer: FC<OrganizationDetailsContainerProps> = ({
  organizationNameId,
  enableLeave,
  ...rendered
}) => {
  const { user } = useUserContext();

  const { data, loading, error } = useAssociatedOrganizationQuery({
    variables: {
      organizationId: organizationNameId,
    },
    errorPolicy: 'all',
  });

  const [disassociateSelfFromOrganization, { loading: removingFromOrganization }] =
    useRemoveUserFromOrganizationMutation();

  const handleRemoveSelfFromOrganization = useCallback(
    async () =>
      await disassociateSelfFromOrganization({
        variables: {
          input: {
            userID: user?.user.id || '',
            organizationID: organizationNameId,
          },
        },
        refetchQueries: [refetchUserOrganizationsQuery({ input: user?.user.id || '' })],
        awaitRefetchQueries: true,
      }),
    [user?.user.id, organizationNameId, disassociateSelfFromOrganization]
  );

  const associatedOrganization = mapToAssociatedOrganization(data?.organization, organizationNameId, {
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
