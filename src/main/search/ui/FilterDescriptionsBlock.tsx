import { HubOutlined, DrawOutlined, GroupOutlined, LibraryBooksOutlined } from '@mui/icons-material';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import { Link } from '@mui/material';
import { PropsWithChildren } from 'react';
import { Caption } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';

type SearchResultsCount =
  | {
      total: number | undefined;
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

const FiltersDescriptionBlock = ({}: FiltersDescriptionBlockProps) => {
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
      <FiltersDescriptionBlockItem href="#spaces">
        <HubOutlined />
        <Caption>
          {t('pages.search.filter.results.spacesAndSubspaces' /*, { count: results?.spaceResults?.total }*/)}
        </Caption>
      </FiltersDescriptionBlockItem>

      <FiltersDescriptionBlockItem href="#collaboration-tools">
        <DrawOutlined />
        <Caption>{t('pages.search.filter.results.callout' /*, { count: results?.calloutResults?.total }*/)}</Caption>
      </FiltersDescriptionBlockItem>

      <FiltersDescriptionBlockItem href="#framing">
        <LibraryBooksOutlined />
        <Caption>{t('pages.search.filter.results.framing' /*, { count: results?.framingResults?.total }*/)}</Caption>
      </FiltersDescriptionBlockItem>

      <FiltersDescriptionBlockItem href="#contributions">
        <LibraryBooksOutlined />
        <Caption>
          {t('pages.search.filter.results.contribution' /*, { count: results?.contributionResults?.total }*/)}
        </Caption>
      </FiltersDescriptionBlockItem>

      <FiltersDescriptionBlockItem href="#contributors">
        <GroupOutlined />
        <Caption>
          {t('pages.search.filter.results.contributor' /*, { count: results?.contributorResults?.total }*/)}
        </Caption>
      </FiltersDescriptionBlockItem>
    </Gutters>
  );
};

const FiltersDescriptionBlockItem = ({ children, href }: PropsWithChildren<{ href: string }>) => (
  <Link href={href} underline="none">
    <Gutters sx={{ flexDirection: 'row', padding: gutters(0.5) }}>{children}</Gutters>
  </Link>
);

export default FiltersDescriptionBlock;
