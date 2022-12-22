import React from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { buildNewOrganizationUrl } from '../../../../../common/utils/urlBuilders';
import AssociatedOrganizationsView2, { AssociatedOrganizationsViewProps } from './AssociatedOrganizationsView';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';

export interface AssociatedOrganizationsDashboardSectionProps<
  Consumed extends {},
  Organization extends Consumed & { nameID: string }
> extends Omit<AssociatedOrganizationsViewProps<Consumed, Organization>, 'entityName'> {
  canCreateOrganization?: boolean;
  title: string;
  helpText?: string;
  enableLeave?: boolean;
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
    <PageContentBlock>
      <PageContentBlockHeader
        title={title}
        actions={
          canCreateOrganization && (
            <Button variant="contained" component={RouterLink} to={buildNewOrganizationUrl()}>
              {t('buttons.create')}
            </Button>
          )
        }
      />
      <AssociatedOrganizationsView2 entityName={title} {...props} />
    </PageContentBlock>
  );
};

export default AssociatedOrganizationsDashboardSection;
