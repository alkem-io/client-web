import { useJourneyBreadcrumbs } from './useJourneyBreadcrumbs';
import Breadcrumbs from '../../../../core/ui/navigation/Breadcrumbs';
import JourneyIcon from '../../../shared/components/JourneyIcon/JourneyIcon';
import BreadcrumbsRootItem from '../../../../main/ui/breadcrumbs/BreadcrumbsRootItem';
import BreadcrumbsItem from '../../../../core/ui/navigation/BreadcrumbsItem';

const JourneyBreadcrumbs = () => {
  const { breadcrumbs } = useJourneyBreadcrumbs();

  return (
    <Breadcrumbs>
      <BreadcrumbsRootItem />
      {breadcrumbs.map(({ journeyTypeName, displayName, ...item }) => (
        <BreadcrumbsItem key={journeyTypeName} iconComponent={JourneyIcon[journeyTypeName]} accent {...item}>
          {displayName}
        </BreadcrumbsItem>
      ))}
    </Breadcrumbs>
  );
};

export default JourneyBreadcrumbs;
