import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '../../../hooks';
import { useAssociatedOrganizationQuery } from '../../../hooks/generated/graphql';
import {
  ContainerPropsWithProvided,
  renderComponentOrChildrenFn,
} from '../../../utils/containers/ComponentOrChildrenFn';
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
