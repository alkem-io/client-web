import PageContent from '@core/ui/content/PageContent';
import PageContentColumn from '@core/ui/content/PageContentColumn';
import PageContentBlock from '@core/ui/content/PageContentBlock';
import { GUTTER_MUI } from '@core/ui/grid/constants';
import { BlockTitle, PageTitle, Text } from '@core/ui/typography';
import DashboardNavigation from '@domain/journey/dashboardNavigation/DashboardNavigation';
import { DashboardNavigationItem } from '@domain/journey/space/spaceDashboardNavigation/useSpaceDashboardNavigation';
import { MouseEventHandler, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Gutters from '@core/ui/grid/Gutters';

const loremIpsum =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const dashboardNavigation: DashboardNavigationItem = {
  id: 'space_0',
  url: '',
  displayName: 'Parent Space',
  member: true,
  children: [
    {
      id: 'subspace_0',
      url: '',
      displayName: 'Challenge 0',
      member: true,
      children: [
        {
          id: 'subspace_0_1',
          url: '',
          displayName: 'Opportunity 0',
          member: false,
        },
      ],
    },
    {
      id: 'subspace_1',
      url: '',
      displayName: 'Challenge 1',
      member: true,
      canCreateSubspace: true,
      children: [
        {
          id: 'subspace_1_1',
          url: '',
          displayName: 'Opportunity 1',
          member: false,
        },
        {
          id: 'subspace_1_2',
          url: '',
          displayName: 'Opportunity 2',
          member: false,
        },
      ],
    },
    {
      id: 'subspace_2',
      url: '',
      displayName: 'Challenge 2',
      member: true,
      children: [
        {
          id: 'subspace_2_1',
          url: '',
          displayName: 'Opportunity 3',
          member: false,
        },
        {
          id: 'subspace_2_2',
          url: '',
          displayName: 'Opportunity 4',
          member: false,
        },
      ],
    },
  ],
};

const DashboardNavigationDemo = () => {
  const [currentSpaceId, setCurrentSpaceId] = useState<string>('space_0');

  const getItemProps = (item: DashboardNavigationItem) => {
    return {
      onClick: () => setCurrentSpaceId(item.id),
    };
  };

  const { pathname } = useLocation();

  const handleClickOnSpace: MouseEventHandler = ({ target }) => {
    if (target['parentElement']?.['parentElement']?.['parentElement']?.['href']?.endsWith(pathname)) {
      setCurrentSpaceId('space_0');
    }
  };

  return (
    <>
      <PageTitle textAlign="center" paddingY={GUTTER_MUI}>
        Dashboard Navigation Demo
      </PageTitle>
      <PageContent onClick={handleClickOnSpace}>
        <PageContentColumn columns={3}>
          <PageContentBlock accent>
            <BlockTitle>Outline Block</BlockTitle>
            <Text>{loremIpsum}</Text>
          </PageContentBlock>
        </PageContentColumn>
        <PageContentColumn columns={1}>
          <Gutters disablePadding alignItems="center">
            <DashboardNavigation
              dashboardNavigation={dashboardNavigation}
              currentItemId={currentSpaceId}
              itemProps={getItemProps}
              compact
            />
          </Gutters>
        </PageContentColumn>
        <PageContentColumn columns={3}>
          <DashboardNavigation
            dashboardNavigation={dashboardNavigation}
            currentItemId={currentSpaceId}
            itemProps={getItemProps}
          />
        </PageContentColumn>
        <PageContentColumn columns={5}>
          <DashboardNavigation
            dashboardNavigation={dashboardNavigation}
            currentItemId={currentSpaceId}
            itemProps={getItemProps}
          />
        </PageContentColumn>
      </PageContent>
    </>
  );
};

export default DashboardNavigationDemo;
