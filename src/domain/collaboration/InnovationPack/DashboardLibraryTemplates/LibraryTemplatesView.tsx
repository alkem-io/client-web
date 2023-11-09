import React, { Dispatch, ReactNode } from 'react';
import PageContentBlockHeaderWithDialogAction from '../../../../core/ui/content/PageContentBlockHeaderWithDialogAction';
import MultipleSelect from '../../../../core/ui/search/MultipleSelect';
import LibraryTemplateCard, { LibraryTemplateCardProps } from './LibraryTemplateCard';
import PageContentBlock, { PageContentBlockProps } from '../../../../core/ui/content/PageContentBlock';
import { Identifiable } from '../../../../core/utils/Identifiable';
import SeeMore from '../../../../core/ui/content/SeeMore';
import { useTranslation } from 'react-i18next';
import ScrollableCardsLayoutContainer from '../../../../core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import { Box, Button, Theme, useMediaQuery } from '@mui/material';
import { CONTRIBUTE_CARD_COLUMNS } from '../../../../core/ui/card/ContributeCard';
import GridItem from '../../../../core/ui/grid/GridItem';
import { TemplateType } from '../InnovationPackProfilePage/InnovationPackProfilePage';
import TemplateTypeFilter from './TemplateTypeFilter';

export interface LibraryTemplatesFilter {
  templateTypes: TemplateType[];
  searchTerms: string[];
}

interface LibraryTemplatesViewProps {
  filter: LibraryTemplatesFilter;
  headerTitle: ReactNode;
  templates: (Identifiable & LibraryTemplateCardProps)[] | undefined;
  onClick: (card: LibraryTemplateCardProps) => void;
  expanded?: boolean;
  onFilterChange: Dispatch<LibraryTemplatesFilter>;
  onDialogOpen?: () => void;
  onDialogClose?: () => void;
  hasMore?: boolean;
}

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
  ...props
}: Omit<PageContentBlockProps, 'onClick'> & LibraryTemplatesViewProps) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const isSmallScreen = useMediaQuery<Theme>(theme => theme.breakpoints.down('lg'));

  return (
    <PageContentBlock {...props}>
      <PageContentBlockHeaderWithDialogAction
        title={headerTitle}
        onDialogOpen={onDialogOpen}
        onDialogClose={onDialogClose}
        expanded={expanded}
        actions={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: isSmallScreen ? 'wrap' : undefined,
            }}
          >
            <TemplateTypeFilter
              onChange={templateTypes =>
                onFilterChange({ templateTypes: templateTypes, searchTerms: filter.searchTerms })
              }
              value={filter.templateTypes}
            />
            <MultipleSelect
              onChange={terms => onFilterChange({ templateTypes: filter.templateTypes, searchTerms: terms })}
              value={filter.searchTerms}
              minLength={2}
              size="xsmall"
              containerProps={{ sx: { flexGrow: isMobile ? 1 : undefined } }}
            />
          </Box>
        }
      />
      {templates && (
        <ScrollableCardsLayoutContainer minHeight={0} orientation={expanded ? 'vertical' : undefined} sameHeight>
          {templates.map(template => (
            <LibraryTemplateCard key={template.id} {...template} onClick={() => onClick(template)} />
          ))}
          {isMobile && hasMore && (
            <GridItem columns={CONTRIBUTE_CARD_COLUMNS}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirections: 'column',
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
      )}
      {!isMobile && hasMore && <SeeMore subject={t('common.templates')} onClick={onDialogOpen} />}
    </PageContentBlock>
  );
};

export default LibraryTemplatesView;
