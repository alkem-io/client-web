import React, { FC } from 'react';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { PageProps } from '../../pages';
import SearchableList, { SearchableListItem } from './SearchableList';
import Button from '../core/Button';
import { Link } from 'react-router-dom';
import Typography from '../core/Typography';

interface GroupListProps extends PageProps {
  data: SearchableListItem[];
  title?: string;
  newLink?: string;
  onDelete?: (id: string) => void;
}

export const ListPage: FC<GroupListProps> = ({ data, paths, title, newLink, onDelete = () => {} }) => {
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
      <SearchableList data={data} onDelete={item => onDelete(item.id)} />
    </>
  );
};

export default ListPage;
