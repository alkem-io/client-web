import { forwardRef } from 'react';
import Breadcrumbs, { BreadcrumbsProps } from '@/core/ui/navigation/Breadcrumbs';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import { useTranslation } from 'react-i18next';
import { Settings } from '@mui/icons-material';
import { Collapsible } from '@/core/ui/navigation/Collapsible';
import { Expandable } from '@/core/ui/navigation/Expandable';
import BreadcrumbsRootItem from '../ui/breadcrumbs/BreadcrumbsRootItem';

const AdminBreadcrumbs = forwardRef<Collapsible, BreadcrumbsProps<Expandable>>(
  <ItemProps extends Expandable>(props: BreadcrumbsProps<ItemProps>, ref) => {
    const { t } = useTranslation();

    return (
      <Breadcrumbs ref={ref} {...props}>
        <BreadcrumbsRootItem />
        <BreadcrumbsItem uri="/admin" iconComponent={Settings}>
          {t('common.administration')}
        </BreadcrumbsItem>
      </Breadcrumbs>
    );
  }
);

export default AdminBreadcrumbs;
