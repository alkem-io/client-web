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

interface FiltersDescriptionBlockProps {
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

const FiltersDescriptionBlock = ({ results }: FiltersDescriptionBlockProps) => {
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
      <FiltersDescriptionBlockItem href="#spaces" disabled={!(results?.spaceResults?.results?.length ?? 0)}>
        <HubOutlined />
        <Caption>
          {t('pages.search.filter.results.spacesAndSubspaces' /*, { count: results?.spaceResults?.total }*/)}
        </Caption>
      </FiltersDescriptionBlockItem>

      <FiltersDescriptionBlockItem
        href="#collaboration-tools"
        disabled={!(results?.calloutResults?.results?.length ?? 0) && !(results?.framingResults?.results?.length ?? 0)}
      >
        <DrawOutlined />
        <Caption>
          {t(
            'pages.search.filter.results.callout' /*, { count: results?.calloutResults?.total + results?.framingResults?.total }*/
          )}
        </Caption>
      </FiltersDescriptionBlockItem>

      <FiltersDescriptionBlockItem
        href="#contributions"
        disabled={!(results?.contributionResults?.results?.length ?? 0)}
      >
        <LibraryBooksOutlined />
        <Caption>
          {t('pages.search.filter.results.contribution' /*, { count: results?.contributionResults?.total }*/)}
        </Caption>
      </FiltersDescriptionBlockItem>

      <FiltersDescriptionBlockItem href="#contributors" disabled={!(results?.contributorResults?.results?.length ?? 0)}>
        <GroupOutlined />
        <Caption>
          {t('pages.search.filter.results.contributor' /*, { count: results?.contributorResults?.total }*/)}
        </Caption>
      </FiltersDescriptionBlockItem>
    </Gutters>
  );
};

const FiltersDescriptionBlockItem = ({
  children,
  href,
  disabled,
}: PropsWithChildren<{ href: string; disabled?: boolean }>) =>
  disabled ? (
    <Tooltip title="No results" arrow>
      <Caption color="textDisabled">
        <Gutters sx={{ flexDirection: 'row', padding: gutters(0.5) }}> {children}</Gutters>
      </Caption>
    </Tooltip>
  ) : (
    <Link href={href} underline="none">
      <Gutters sx={{ flexDirection: 'row', padding: gutters(0.5) }}> {children}</Gutters>
    </Link>
  );

export default FiltersDescriptionBlock;
