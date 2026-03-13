import { Button } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import type { Identifiable } from '@/core/utils/Identifiable';
import { CreateOrganizationDialog } from '../CreateOrganizationDialog';
import AssociatedOrganizationsView, { type AssociatedOrganizationsViewProps } from './AssociatedOrganizationsView';

export interface AssociatedOrganizationsDashboardSectionProps<
  Consumed extends {},
  Organization extends Consumed & Identifiable,
> extends Omit<AssociatedOrganizationsViewProps<Consumed, Organization>, 'entityName'> {
  canCreateOrganization?: boolean;
  title: string;
  helpText?: string;
  enableLeave?: boolean;
}

export const AssociatedOrganizationsDashboardSection = <
  Consumed extends {},
  Organization extends Consumed & Identifiable,
>({
  loading,
  canCreateOrganization = false,
  title,
  helpText,
  ...props
}: AssociatedOrganizationsDashboardSectionProps<Consumed, Organization>) => {
  const { t } = useTranslation();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <PageContentBlock>
      <PageContentBlockHeader
        title={title}
        actions={
          canCreateOrganization && (
            <Button variant="contained" onClick={() => setCreateOpen(true)}>
              {t('buttons.create')}
            </Button>
          )
        }
      />
      <AssociatedOrganizationsView entityName={title} {...props} />
      <CreateOrganizationDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </PageContentBlock>
  );
};

export default AssociatedOrganizationsDashboardSection;
