import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@material-ui/core';
import { useUpdateNavigation } from '../../hooks';
import { PageProps } from '../../pages';
import SearchableList, { SearchableListItem } from './SearchableList';
import Button from '../core/Button';
import Typography from '../core/Typography';

interface ListPageProps extends PageProps {
  data: SearchableListItem[];
  title?: string;
  newLink?: string;
  onDelete?: (item: SearchableListItem) => void;
}

export const ListPage: FC<ListPageProps> = ({ data, paths, title, newLink, onDelete }) => {
  const { t } = useTranslation();
  useUpdateNavigation({ currentPaths: paths });

  return (
    <Container maxWidth="xl">
      {(title || newLink) && (
        <div className={'d-flex mb-4'}>
          {title && <Typography variant={'h3'}>{title}</Typography>}
          {newLink && <Button className={'ml-auto'} as={Link} to={newLink} text={t('buttons.new')} />}
        </div>
      )}
      <SearchableList data={data} onDelete={onDelete} />
    </Container>
  );
};

export default ListPage;
