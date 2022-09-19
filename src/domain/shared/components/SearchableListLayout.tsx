import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import WrapperTypography from '../../../common/components/core/WrapperTypography';
import WrapperButton from '../../../common/components/core/WrapperButton';

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
            {title && <WrapperTypography variant="h3">{title}</WrapperTypography>}
          </Grid>
          <Grid container item justifyContent="flex-end" xs={2}>
            {newLink && <WrapperButton as={Link} to={newLink} text={t('buttons.new')} />}
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
