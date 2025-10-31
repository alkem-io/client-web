import RouterLink from '@/core/ui/link/RouterLink';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { Button } from '@mui/material';
import { FC, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import PageContent from '@/core/ui/content/PageContent';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import { BlockTitle } from '@/core/ui/typography';
import Gutters from '@/core/ui/grid/Gutters';

interface ListPageProps extends PropsWithChildren {
  title?: string;
  newLink?: string;
}

const SearchableListLayout: FC<ListPageProps> = ({ title, newLink, children }) => {
  const { t } = useTranslation();

  return (
    <PageContent>
      <PageContentColumn columns={12}>
        {(title || newLink) && (
          <Gutters paddingY={0} sx={{ width: '100%' }}>
            {title && (
              <Gutters row justifyContent="space-between" alignItems="center" disablePadding>
                <BlockTitle>{title}</BlockTitle>
              </Gutters>
            )}
            {newLink && (
              <Gutters disablePadding disableGap alignItems={'flex-end'}>
                <Button startIcon={<AddOutlinedIcon />} variant="contained" component={RouterLink} to={newLink}>
                  {t('buttons.create')}
                </Button>
              </Gutters>
            )}
          </Gutters>
        )}
        <Gutters disablePadding sx={{ width: '100%' }}>
          {children}
        </Gutters>
      </PageContentColumn>
    </PageContent>
  );
};

export default SearchableListLayout;
