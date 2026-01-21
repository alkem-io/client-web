import { Dispatch, ReactNode } from 'react';
import { Box, Button, Skeleton } from '@mui/material';
import PageContentBlockHeaderWithDialogAction from '@/core/ui/content/PageContentBlockHeaderWithDialogAction';
import MultipleSelect from '@/core/ui/search/MultipleSelect';
import PageContentBlock, { PageContentBlockProps } from '@/core/ui/content/PageContentBlock';
import SeeMore from '@/core/ui/content/SeeMore';
import { useTranslation } from 'react-i18next';
import ScrollableCardsLayoutContainer from '@/core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import { CONTRIBUTE_CARD_COLUMNS } from '@/core/ui/card/ContributeCard';
import GridItem from '@/core/ui/grid/GridItem';
import TemplateTypeFilter from './TemplateTypeFilter';
import TemplateTypeFilterMobile from './TemplateTypeFilterMobile';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import TemplateCard from '@/domain/templates/components/cards/TemplateCard';
import { AnyTemplate, AnyTemplateWithInnovationPack } from '@/domain/templates/models/TemplateBase';
import { gutters } from '@/core/ui/grid/utils';
import { useTheme } from '@mui/material';
import { useScreenSize } from '@/core/ui/grid/constants';

export interface LibraryTemplatesFilter {
  templateTypes: TemplateType[];
  searchTerms: string[];
}

type LibraryTemplatesViewProps = {
  filter: LibraryTemplatesFilter;
  headerTitle: ReactNode;
  templates: AnyTemplateWithInnovationPack[] | undefined;
  onClick: (template: AnyTemplate) => void;
  expanded?: boolean;
  onFilterChange: Dispatch<LibraryTemplatesFilter>;
  onDialogOpen?: () => void;
  onDialogClose?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  headerTitleId?: string;
};

const LibraryTemplatesView = ({
  headerTitle,
  templates,
  filter,
  onFilterChange,
  expanded = false,
  onDialogOpen,
  onDialogClose,
  onClick,
  hasMore = false,
  loading,
  headerTitleId,
  ...props
}: Omit<PageContentBlockProps, 'onClick'> & LibraryTemplatesViewProps) => {
  const { t } = useTranslation();
  const { isSmallScreen } = useScreenSize();
  const theme = useTheme();

  return (
    <PageContentBlock {...props}>
      <PageContentBlockHeaderWithDialogAction
        title={headerTitle}
        onDialogOpen={onDialogOpen}
        onDialogClose={onDialogClose}
        expanded={expanded}
        titleId={headerTitleId}
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {isSmallScreen ? (
          <TemplateTypeFilterMobile
            value={filter.templateTypes}
            onChange={templateTypes =>
              onFilterChange({ templateTypes: templateTypes, searchTerms: filter.searchTerms })
            }
          />
        ) : (
          <TemplateTypeFilter
            onChange={templateTypes =>
              onFilterChange({ templateTypes: templateTypes, searchTerms: filter.searchTerms })
            }
            value={filter.templateTypes}
          />
        )}
        <MultipleSelect
          onChange={terms => onFilterChange({ templateTypes: filter.templateTypes, searchTerms: terms })}
          value={filter.searchTerms}
          minLength={2}
          size="xsmall"
          containerProps={{ sx: { flexGrow: isSmallScreen ? 1 : undefined, marginLeft: 'auto' } }}
          inlineTerms
        />
      </Box>

      <ScrollableCardsLayoutContainer minHeight={0} orientation={expanded ? 'vertical' : undefined} sameHeight>
        {loading
          ? Array.from({ length: isSmallScreen ? 2 : 5 }).map((_, idx) => (
              <Skeleton
                key={idx}
                width={gutters(12)(theme)}
                height={gutters(13)(theme)}
                animation="pulse"
                variant="rectangular"
                sx={{ borderRadius: 1 }}
              />
            ))
          : templates?.map(({ template, innovationPack }) => (
              <TemplateCard
                key={template.id}
                template={template}
                innovationPack={innovationPack}
                onClick={() => onClick(template)}
              />
            ))}

        {isSmallScreen && !loading && hasMore && (
          <GridItem columns={CONTRIBUTE_CARD_COLUMNS}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Button variant="contained" onClick={onDialogOpen}>
                {t('common.show-all')}
              </Button>
            </Box>
          </GridItem>
        )}
      </ScrollableCardsLayoutContainer>

      {!isSmallScreen && hasMore && <SeeMore subject={t('common.Templates')} onClick={onDialogOpen} />}
    </PageContentBlock>
  );
};

export default LibraryTemplatesView;
