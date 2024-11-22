import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { buildNewOrganizationUrl } from '@/main/routing/urlBuilders';
import AssociatedOrganizationsView, { AssociatedOrganizationsViewProps } from './AssociatedOrganizationsView';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';

export interface AssociatedOrganizationsDashboardSectionProps<
  Consumed extends {},
  Organization extends Consumed & { key: string }
> extends Omit<AssociatedOrganizationsViewProps<Consumed, Organization>, 'entityName'> {
  canCreateOrganization?: boolean;
  title: string;
  helpText?: string;
  enableLeave?: boolean;
}

export const AssociatedOrganizationsDashboardSection = <
  Consumed extends {},
  Organization extends Consumed & { key: string }
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
      <AssociatedOrganizationsView entityName={title} {...props} />
    </PageContentBlock>
  );
};

export default AssociatedOrganizationsDashboardSection;
