import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useUpdateNavigation } from '../../hooks';
import Button from '../core/Button';
import Typography from '../core/Typography';
import SearchableList, { SearchableListItem } from './SearchableList';
import { Path } from '../../context/NavigationProvider';

interface ListPageProps {
  data: SearchableListItem[];
  title?: string;
  newLink?: string;
  onDelete?: (item: SearchableListItem) => void;
  loading?: boolean;
  // TODO Manipulating navigation from a simple view is bad design.
  // We should only touch top-level UI parts from top-level components,
  // that are aware of the app structure / rendering context, i.e. Pages.
  paths?: Path[];
}

export const ListPage: FC<ListPageProps> = ({ data, paths, title, newLink, onDelete, loading }) => {
  const { t } = useTranslation();
  useUpdateNavigation({ currentPaths: paths });

  return (
    <Grid container spacing={2} justifyContent={'center'}>
      {(title || newLink) && (
        <Grid container item xs={10}>
          <Grid item xs={10}>
            {title && <Typography variant={'h3'}>{title}</Typography>}
          </Grid>
          <Grid container item justifyContent={'flex-end'} xs={2}>
            {newLink && <Button as={Link} to={newLink} text={t('buttons.new')} />}
          </Grid>
        </Grid>
      )}
      <Grid item xs={10}>
        <SearchableList data={data} onDelete={onDelete} loading={loading} />
      </Grid>
    </Grid>
  );
};

export default ListPage;
