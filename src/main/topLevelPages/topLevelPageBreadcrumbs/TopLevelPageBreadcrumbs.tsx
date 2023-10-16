import Breadcrumbs from '../../../core/ui/navigation/Breadcrumbs';
import BreadcrumbsRootItem from '../../ui/breadcrumbs/BreadcrumbsRootItem';
import { ComponentType, PropsWithChildren } from 'react';
import BreadcrumbsItem from '../../../core/ui/navigation/BreadcrumbsItem';
import { useLocation } from 'react-router-dom';
import { SvgIconProps } from '@mui/material';
import { Visual } from '../../../domain/common/visual/Visual';

interface TopLevelPageBreadcrumbsProps {
  avatar?: Visual;
  loading?: boolean;
  iconComponent?: ComponentType<SvgIconProps>;
}

const TopLevelPageBreadcrumbs = (props: PropsWithChildren<TopLevelPageBreadcrumbsProps>) => {
  const { pathname } = useLocation();

  return (
    <Breadcrumbs>
      <BreadcrumbsRootItem />
      <BreadcrumbsItem uri={pathname} {...props} />
    </Breadcrumbs>
  );
};

export default TopLevelPageBreadcrumbs;
