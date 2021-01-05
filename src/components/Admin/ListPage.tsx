import React, { FC } from 'react';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { PageProps } from '../../pages';
import SearchableList, { SearchableListData } from './SearchableList';
import Button from '../core/Button';
import { Link } from 'react-router-dom';
import Typography from '../core/Typography';

interface GroupListProps extends PageProps {
  data: SearchableListData[];
  title?: string;
  newLink?: string;
}

export const ListPage: FC<GroupListProps> = ({ data, paths, title, newLink }) => {
  useUpdateNavigation({ currentPaths: paths });

  return (
    <>
      {(title || newLink) && (
        <div className={'d-flex mb-4'}>
          {title && <Typography variant={'h3'}>{title}</Typography>}
          {newLink && (
            <Button className={'ml-auto'} as={Link} to={newLink}>
              New
            </Button>
          )}
        </div>
      )}
      <SearchableList data={data} />
    </>
  );
};

export default ListPage;
