import React from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import DashboardGenericSection from '../../shared/components/DashboardSections/DashboardGenericSection';
import { buildNewOrganizationUrl } from '../../../utils/urlBuilders';
import AssociatedOrganizationsView2, { AssociatedOrganizationsViewProps } from './AssociatedOrganizationsView';

export interface AssociatedOrganizationsDashboardSectionProps<
  Consumed extends {},
  Organization extends Consumed & { nameID: string }
> extends Omit<AssociatedOrganizationsViewProps<Consumed, Organization>, 'entityName'> {
  canCreateOrganization?: boolean;
  title: string;
  helpText?: string;
}

export const AssociatedOrganizationsDashboardSection = <
  Consumed extends {},
  Organization extends Consumed & { nameID: string }
>({
  loading,
  canCreateOrganization = false,
  title,
  helpText,
  ...props
}: AssociatedOrganizationsDashboardSectionProps<Consumed, Organization>) => {
  const { t } = useTranslation();

  return (
    <DashboardGenericSection
      headerText={title}
      helpText={helpText}
      primaryAction={
        canCreateOrganization && (
          <Button variant="contained" component={RouterLink} to={buildNewOrganizationUrl()}>
            {t('buttons.create')}
          </Button>
        )
      }
    >
      <AssociatedOrganizationsView2 entityName={title} {...props} />
    </DashboardGenericSection>
  );
};

export default AssociatedOrganizationsDashboardSection;
