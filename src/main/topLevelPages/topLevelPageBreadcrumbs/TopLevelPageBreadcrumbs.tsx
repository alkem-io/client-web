import Breadcrumbs, { BreadcrumbsProps } from '@/core/ui/navigation/Breadcrumbs';
import BreadcrumbsRootItem from '@/main/ui/breadcrumbs/BreadcrumbsRootItem';
import { Collapsible } from '@/core/ui/navigation/Collapsible';
import { Expandable } from '@/core/ui/navigation/Expandable';

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
