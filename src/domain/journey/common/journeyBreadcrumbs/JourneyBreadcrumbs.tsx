import { useJourneyBreadcrumbs } from './useJourneyBreadcrumbs';
import Breadcrumbs, { BreadcrumbsProps } from '../../../../core/ui/navigation/Breadcrumbs';
import JourneyIcon from '../../../shared/components/JourneyIcon/JourneyIcon';
import BreadcrumbsRootItem from '../../../../main/ui/breadcrumbs/BreadcrumbsRootItem';
import BreadcrumbsItem from '../../../../core/ui/navigation/BreadcrumbsItem';
import { Expandable } from '../../../../core/ui/navigation/Expandable';
import { forwardRef, ReactElement, Ref } from 'react';
import { Collapsible } from '../../../../core/ui/navigation/Collapsible';

const JourneyBreadcrumbs = forwardRef<Collapsible, BreadcrumbsProps<Expandable>>(
  <ItemProps extends Expandable>(props: BreadcrumbsProps<ItemProps>, ref) => {
    const { breadcrumbs } = useJourneyBreadcrumbs();

    return (
      <Breadcrumbs ref={ref} {...props}>
        <BreadcrumbsRootItem />
        {breadcrumbs.map(({ journeyTypeName, displayName, ...item }) => (
          <BreadcrumbsItem key={journeyTypeName} iconComponent={JourneyIcon[journeyTypeName]} accent {...item}>
            {displayName}
          </BreadcrumbsItem>
        ))}
      </Breadcrumbs>
    );
  }
) as <ItemProps extends Expandable>(props: BreadcrumbsProps<ItemProps> & { ref?: Ref<Collapsible> }) => ReactElement;

export default JourneyBreadcrumbs;
