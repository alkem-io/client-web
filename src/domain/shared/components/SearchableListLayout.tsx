import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Typography from '../../../components/core/Typography';
import Button from '../../../components/core/Button';

interface ListPageProps {
  title?: string;
  newLink?: string;
}

export const SearchableListLayout: FC<ListPageProps> = ({ title, newLink, children }) => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={2} justifyContent="center">
      {(title || newLink) && (
        <Grid container item xs={10}>
          <Grid item xs={10}>
            {title && <Typography variant="h3">{title}</Typography>}
          </Grid>
          <Grid container item justifyContent="flex-end" xs={2}>
            {newLink && <Button as={Link} to={newLink} text={t('buttons.new')} />}
          </Grid>
        </Grid>
      )}
      <Grid item xs={10}>
        {children}
      </Grid>
    </Grid>
  );
};

export default SearchableListLayout;
