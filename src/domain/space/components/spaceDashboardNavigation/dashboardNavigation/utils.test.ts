import { expect, it, describe } from 'vitest';
import { findCurrentPath } from './utils';
import { DashboardNavigationItem } from '../useSpaceDashboardNavigation';

const dashboardNavigation: DashboardNavigationItem = {
  id: 'space_0',
  url: '',
  displayName: 'Space 0',
  member: true,
  children: [
    {
      id: 'subspace_0',
      url: '',
      displayName: 'Subspace 0',
      member: true,
      children: [
        {
          id: 'subspace_0_1',
          url: '',
          displayName: 'Subsubspace 0',
          member: false,
        },
      ],
    },
    {
      id: 'subspace_1',
      url: '',
      displayName: 'Subspace 1',
      member: true,
      children: [
        {
          id: 'subspace_1_1',
          url: '',
          displayName: 'Subsubspace 1',
          member: false,
        },
        {
          id: 'subspace_1_2',
          url: '',
          displayName: 'Subsubspace 2',
          member: false,
          children: [
            {
              id: 'subspace_1_2_1',
              url: '',
              displayName: '',
              member: false,
            },
          ],
        },
      ],
    },
    {
      id: 'subspace_2',
      url: '',
      displayName: 'Subspace 2',
      member: true,
      children: [
        {
          id: 'subspace_2_1',
          url: '',
          displayName: 'Subsubspace 3',
          member: false,
        },
        {
          id: 'subspace_2_2',
          url: '',
          displayName: 'Subsubspace 4',
          member: false,
        },
      ],
    },
  ],
};

describe('findCurrentPath', () => {
  it('should return empty array if currentItemId is not defined', () => {
    expect(findCurrentPath(dashboardNavigation, undefined)).toEqual([]);
  });

  it('should return empty array if currentItemId is not found', () => {
    expect(findCurrentPath(dashboardNavigation, 'subspace_2_4')).toEqual([]);
  });

  it('should return path to the item if it is found', () => {
    expect(findCurrentPath(dashboardNavigation, 'subspace_2_2')).toEqual(['space_0', 'subspace_2', 'subspace_2_2']);
  });

  it('should support deepness > 2', () => {
    expect(findCurrentPath(dashboardNavigation, 'subspace_1_2_1')).toEqual([
      'space_0',
      'subspace_1',
      'subspace_1_2',
      'subspace_1_2_1',
    ]);
  });
});
