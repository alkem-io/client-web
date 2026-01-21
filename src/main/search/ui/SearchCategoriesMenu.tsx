import { HubOutlined, DrawOutlined, GroupOutlined, LibraryBooksOutlined } from '@mui/icons-material';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import { Link, Tooltip } from '@mui/material';
import { PropsWithChildren } from 'react';
import { Caption } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';

type SearchResultsCount =
  | {
      total: number | undefined;
      results: unknown[] | undefined;
    }
  | undefined;

interface SearchCategoriesMenuProps {
  results:
    | {
        spaceResults: SearchResultsCount;
        calloutResults: SearchResultsCount;
        framingResults: SearchResultsCount;
        contributionResults: SearchResultsCount;
        contributorResults: SearchResultsCount;
      }
    | undefined;
}

const SearchCategoriesMenu = ({ results }: SearchCategoriesMenuProps) => {
  const { t } = useTranslation();

  return (
    <Gutters
      disableGap
      disablePadding
      sx={theme => ({
        position: 'sticky',
        top: 80,

        minWidth: 250,
        borderRadius: 1,
        height: 'fit-content',
        border: `1px solid ${theme.palette.divider}`,
      })}
    >
      <SearchCategoriesMenuItem href="#spaces" disabled={!(results?.spaceResults?.results?.length ?? 0)}>
        <HubOutlined />
        <Caption>
          {t('pages.search.filter.results.spacesAndSubspaces' /*, { count: results?.spaceResults?.total }*/)}
        </Caption>
      </SearchCategoriesMenuItem>

      <SearchCategoriesMenuItem
        href="#collaboration-tools"
        disabled={!(results?.calloutResults?.results?.length ?? 0) && !(results?.framingResults?.results?.length ?? 0)}
      >
        <DrawOutlined />
        <Caption>
          {t(
            'pages.search.filter.results.callout' /*, { count: results?.calloutResults?.total + results?.framingResults?.total }*/
          )}
        </Caption>
      </SearchCategoriesMenuItem>

      <SearchCategoriesMenuItem href="#contributions" disabled={!(results?.contributionResults?.results?.length ?? 0)}>
        <LibraryBooksOutlined />
        <Caption>
          {t('pages.search.filter.results.contribution' /*, { count: results?.contributionResults?.total }*/)}
        </Caption>
      </SearchCategoriesMenuItem>

      <SearchCategoriesMenuItem href="#contributors" disabled={!(results?.contributorResults?.results?.length ?? 0)}>
        <GroupOutlined />
        <Caption>
          {t('pages.search.filter.results.contributor' /*, { count: results?.contributorResults?.total }*/)}
        </Caption>
      </SearchCategoriesMenuItem>
    </Gutters>
  );
};

const SearchCategoriesMenuItem = ({
  children,
  href,
  disabled,
}: PropsWithChildren<{ href: string; disabled?: boolean }>) => {
  const { t } = useTranslation();
  if (disabled) {
    return (
      <Tooltip title={t('pages.search.filter.results.noResults')} arrow>
        <Gutters
          tabIndex={0}
          role="link"
          aria-disabled="true"
          sx={{
            flexDirection: 'row',
            padding: gutters(0.5),
            userSelect: 'none',
            color: theme => theme.palette.text.disabled,
            cursor: 'default',
          }}
        >
          {children}
        </Gutters>
      </Tooltip>
    );
  }
  return (
    <Link href={href} underline="none">
      <Gutters sx={{ flexDirection: 'row', padding: gutters(0.5) }}>{children}</Gutters>
    </Link>
  );
};

export default SearchCategoriesMenu;
