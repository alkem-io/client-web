import { List, ListItemText, Skeleton } from '@mui/material';
import { Filter } from '@/domain/platformAdmin/components/Common/Filter';
import type { Discussion } from '../models/Discussion';
import DiscussionOverview from './DiscussionOverview';

interface DiscussionListViewProps {
  filterEnabled: boolean;
  onClickDiscussion: (discussion: Discussion) => void;
  loading: boolean;
  discussions: Discussion[];
}

export const DiscussionListView = ({
  filterEnabled,
  onClickDiscussion,
  loading,
  discussions,
}: DiscussionListViewProps) => {
  return (
    <>
      {loading && (
        <List>
          <ListItemText
            primary={<Skeleton />}
            secondary={
              <>
                <Skeleton />
                <Skeleton />
              </>
            }
          />
        </List>
      )}
      {!loading && filterEnabled && (
        <Filter
          data={discussions}
          limitKeys={['title']}
          sort={[
            { key: 'createdAt', name: 'Newest', order: 'desc', default: true },
            { key: 'createdAt', name: 'Oldest', order: 'asc' },
          ]}
        >
          {filteredData => (
            <List>
              {filteredData.map((item, index) => (
                <DiscussionOverview key={index} discussion={item} onClick={onClickDiscussion} />
              ))}
            </List>
          )}
        </Filter>
      )}
      {!loading && !filterEnabled && (
        <List>
          {discussions.map((item, index) => (
            <DiscussionOverview key={index} discussion={item} onClick={onClickDiscussion} />
          ))}
        </List>
      )}
    </>
  );
};
