import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '../../user';
import {
  refetchUserOrganizationsQuery,
  useAssociatedOrganizationQuery,
  useRemoveUserFromOrganizationMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import {
  ContainerPropsWithProvided,
  renderComponentOrChildrenFn,
} from '../../../../../common/utils/containers/ComponentOrChildrenFn';
import { AssociatedOrganization, mapToAssociatedOrganization } from './AssociatedOrganization';

export type OrganizationDetailsContainerProps = ContainerPropsWithProvided<
  {
    organizationNameId: string;
  },
  AssociatedOrganization & {
    handleRemoveSelfFromOrganization: () => void;
    removingFromOrganization?: boolean;
  }
>;

export const AssociatedOrganizationContainer: FC<OrganizationDetailsContainerProps> = ({
  organizationNameId,
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

  const { t } = useTranslation();

  const associatedOrganization = mapToAssociatedOrganization(data?.organization, organizationNameId, user?.user, t, {
    loading,
    error,
  });

  return renderComponentOrChildrenFn(rendered, {
    ...associatedOrganization,
    handleRemoveSelfFromOrganization,
    removingFromOrganization,
  });
};

export default AssociatedOrganizationContainer;
