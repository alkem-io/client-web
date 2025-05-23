import { gutters } from '@/core/ui/grid/utils';
import RouterLink from '@/core/ui/link/RouterLink';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { Button, GridLegacy, Typography } from '@mui/material';
import { FC, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

interface ListPageProps extends PropsWithChildren {
  title?: string;
  newLink?: string;
}

export const SearchableListLayout: FC<ListPageProps> = ({ title, newLink, children }) => {
  const { t } = useTranslation();

  return (
    <GridLegacy container spacing={2} justifyContent="center">
      {(title || newLink) && (
        <GridLegacy container item xs={10} paddingX={gutters(1)}>
          <GridLegacy item xs={10}>
            {title && (
              <Typography variant="h3" mb={1} fontWeight="medium">
                {title}
              </Typography>
            )}
          </GridLegacy>
          <GridLegacy container item justifyContent="flex-end" xs={2}>
            {newLink && (
              <Button startIcon={<AddOutlinedIcon />} variant="contained" component={RouterLink} to={newLink}>
                {t('buttons.create')}
              </Button>
            )}
          </GridLegacy>
        </GridLegacy>
      )}
      <GridLegacy item xs={10}>
        {children}
      </GridLegacy>
    </GridLegacy>
  );
};

export default SearchableListLayout;
