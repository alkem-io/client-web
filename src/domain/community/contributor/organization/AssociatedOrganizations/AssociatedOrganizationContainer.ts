import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '../../user';
import { useAssociatedOrganizationQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import {
  ContainerPropsWithProvided,
  renderComponentOrChildrenFn,
} from '../../../../../common/utils/containers/ComponentOrChildrenFn';
import { AssociatedOrganization, mapToAssociatedOrganization } from './AssociatedOrganization';

export type OrganizationDetailsContainerProps = ContainerPropsWithProvided<
  {
    organizationNameId: string;
  },
  AssociatedOrganization
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

  const { t } = useTranslation();

  const associatedOrganization = mapToAssociatedOrganization(data?.organization, organizationNameId, user?.user, t, {
    loading,
    error,
  });

  return renderComponentOrChildrenFn(rendered, associatedOrganization);
};

export default AssociatedOrganizationContainer;
