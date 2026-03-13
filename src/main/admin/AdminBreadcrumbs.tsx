import { Settings } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import Breadcrumbs, { type BreadcrumbsProps } from '@/core/ui/navigation/Breadcrumbs';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import type { Collapsible } from '@/core/ui/navigation/Collapsible';
import type { Expandable } from '@/core/ui/navigation/Expandable';
import BreadcrumbsRootItem from '../ui/breadcrumbs/BreadcrumbsRootItem';

const AdminBreadcrumbs = ({
  ref,
  ...props
}: Partial<Collapsible> &
  BreadcrumbsProps<Expandable> & {
    ref?: React.Ref<Collapsible>;
  }) => {
  const { t } = useTranslation();

  return (
    <Breadcrumbs ref={ref} {...props}>
      <BreadcrumbsRootItem />
      <BreadcrumbsItem uri="/admin" iconComponent={Settings}>
        {t('common.administration')}
      </BreadcrumbsItem>
    </Breadcrumbs>
  );
};

export default AdminBreadcrumbs;
