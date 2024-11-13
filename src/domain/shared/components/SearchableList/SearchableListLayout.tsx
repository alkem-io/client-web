import { Button, Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import WrapperTypography from '@core/ui/typography/deprecated/WrapperTypography';
import RouterLink from '@core/ui/link/RouterLink';
import { gutters } from '@core/ui/grid/utils';

interface ListPageProps {
  title?: string;
  newLink?: string;
}

export const SearchableListLayout: FC<ListPageProps> = ({ title, newLink, children }) => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={2} justifyContent="center">
      {(title || newLink) && (
        <Grid container item xs={10} paddingX={gutters(1)}>
          <Grid item xs={10}>
            {title && <WrapperTypography variant="h3">{title}</WrapperTypography>}
          </Grid>
          <Grid container item justifyContent="flex-end" xs={2}>
            {newLink && (
              <Button startIcon={<AddOutlinedIcon />} variant="contained" component={RouterLink} to={newLink}>
                {t('buttons.create')}
              </Button>
            )}
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
