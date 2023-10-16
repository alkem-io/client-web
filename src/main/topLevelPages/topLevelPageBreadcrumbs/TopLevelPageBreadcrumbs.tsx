import Breadcrumbs from '../../../core/ui/navigation/Breadcrumbs';
import BreadcrumbsRootItem from '../../ui/breadcrumbs/BreadcrumbsRootItem';
import { ComponentType, PropsWithChildren } from 'react';
import BreadcrumbsItem from '../../../core/ui/navigation/BreadcrumbsItem';
import { SvgIconProps } from '@mui/material';
import { Visual } from '../../../domain/common/visual/Visual';

interface TopLevelPageBreadcrumbsProps {
  avatar?: Visual;
  loading?: boolean;
  iconComponent?: ComponentType<SvgIconProps>;
  uri: string;
}

const TopLevelPageBreadcrumbs = (props: PropsWithChildren<TopLevelPageBreadcrumbsProps>) => {
  return (
    <Breadcrumbs>
      <BreadcrumbsRootItem />
      <BreadcrumbsItem {...props} />
    </Breadcrumbs>
  );
};

export default TopLevelPageBreadcrumbs;
