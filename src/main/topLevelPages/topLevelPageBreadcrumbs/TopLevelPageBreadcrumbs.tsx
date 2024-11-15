import Breadcrumbs, { BreadcrumbsProps } from '@/core/ui/navigation/Breadcrumbs';
import BreadcrumbsRootItem from '../../ui/breadcrumbs/BreadcrumbsRootItem';
import { forwardRef } from 'react';
import { Collapsible } from '@/core/ui/navigation/Collapsible';
import { Expandable } from '@/core/ui/navigation/Expandable';

const TopLevelPageBreadcrumbs = forwardRef<Collapsible, BreadcrumbsProps<Expandable>>(
  <ItemProps extends Expandable>({ children, ...props }: BreadcrumbsProps<ItemProps>, ref) => {
    return (
      <Breadcrumbs ref={ref} {...props}>
        <BreadcrumbsRootItem />
        {children}
      </Breadcrumbs>
    );
  }
);

export default TopLevelPageBreadcrumbs;
