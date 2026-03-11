import Breadcrumbs, { type BreadcrumbsProps } from '@/core/ui/navigation/Breadcrumbs';
import type { Collapsible } from '@/core/ui/navigation/Collapsible';
import type { Expandable } from '@/core/ui/navigation/Expandable';
import BreadcrumbsRootItem from '@/main/ui/breadcrumbs/BreadcrumbsRootItem';

const TopLevelPageBreadcrumbs = ({
  ref,
  children,
  ...props
}: BreadcrumbsProps<Expandable> & {
  ref?: React.RefObject<Collapsible>;
}) => {
  return (
    <Breadcrumbs ref={ref} {...props}>
      <BreadcrumbsRootItem />
      {children}
    </Breadcrumbs>
  );
};

export default TopLevelPageBreadcrumbs;
