import { useSearchParams } from 'react-router-dom';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { TabbedLayoutParams } from '@/main/routing/urlBuilders';
import { useSpace } from '../context/useSpace';
import useSpaceTabs from './tabbedLayout/layout/useSpaceTabs';

export const useSectionIndex = ({ spaceId, spaceLevel }: { spaceId?: string; spaceLevel?: SpaceLevel }) => {
  const [searchParams] = useSearchParams();

  const { permissions } = useSpace();

  const { defaultTabIndex } = useSpaceTabs({
    spaceId: spaceId,
    skip: !spaceId || spaceLevel !== SpaceLevel.L0 || !permissions.canRead,
  });

  let sectionIndex = searchParams.get(TabbedLayoutParams.Section);
  if (!sectionIndex) {
    if (defaultTabIndex && defaultTabIndex >= 0) {
      sectionIndex = defaultTabIndex.toString();
    } else {
      sectionIndex = '0'; // set default to dashboard
    }
  } else {
    sectionIndex = `${parseInt(sectionIndex, 10) - 1}`;
  }

  return sectionIndex;
};
