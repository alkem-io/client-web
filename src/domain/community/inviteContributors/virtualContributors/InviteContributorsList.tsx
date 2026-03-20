import { noop } from 'lodash-es';
import GridContainer from '@/core/ui/grid/GridContainer';
import GridItem from '@/core/ui/grid/GridItem';
import UserCard from '../../user/userCard/UserCard';
import type { ContributorProps } from '../InviteContributorsProps';

interface InviteContributorsListProps {
  contributors: ContributorProps[] | undefined;
  onCardClick?: (id: string) => void;
}

const InviteContributorsList = ({ contributors = [], onCardClick = noop }: InviteContributorsListProps) => {
  return (
    <GridContainer sx={{ paddingX: 0 }}>
      {contributors.map(c => (
        <GridItem key={c.id}>
          <UserCard
            isExpandable={false}
            displayName={c.profile?.displayName}
            avatarSrc={c.profile?.avatar?.uri ?? ''}
            avatarAltText={c.profile?.displayName}
            tags={c.profile?.tagsets?.flatMap(tagset => tagset.tags ?? []) ?? []}
            city={c.profile?.location?.city ?? ''}
            country={c.profile?.location?.country ?? ''}
            isContactable={false}
            onCardClick={() => onCardClick(c.id ?? '')}
          />
        </GridItem>
      ))}
    </GridContainer>
  );
};

export default InviteContributorsList;
