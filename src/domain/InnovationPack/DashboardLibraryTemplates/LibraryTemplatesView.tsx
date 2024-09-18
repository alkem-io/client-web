import React, { Dispatch, ReactNode } from 'react';
import { Box, Button, Theme, useMediaQuery } from '@mui/material';
import PageContentBlockHeaderWithDialogAction from '../../../core/ui/content/PageContentBlockHeaderWithDialogAction';
import MultipleSelect from '../../../core/ui/search/MultipleSelect';
import PageContentBlock, { PageContentBlockProps } from '../../../core/ui/content/PageContentBlock';
import SeeMore from '../../../core/ui/content/SeeMore';
import { useTranslation } from 'react-i18next';
import ScrollableCardsLayoutContainer from '../../../core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import { CONTRIBUTE_CARD_COLUMNS } from '../../../core/ui/card/ContributeCard';
import GridItem from '../../../core/ui/grid/GridItem';
import TemplateTypeFilter from './TemplateTypeFilter';
import TemplateTypeFilterMobile from './TemplateTypeFilterMobile';
import { TemplateType } from '../../../core/apollo/generated/graphql-schema';
import TemplateCard from '../../templates/components/cards/TemplateCard';
import { AnyTemplate, AnyTemplateWithInnovationPack } from '../../templates/models/TemplateBase';

export interface LibraryTemplatesFilter {
  templateTypes: TemplateType[];
  searchTerms: string[];
}

interface LibraryTemplatesViewProps {
  filter: LibraryTemplatesFilter;
  headerTitle: ReactNode;
  templates: AnyTemplateWithInnovationPack[] | undefined;
  onClick: (template: AnyTemplate) => void;
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

  return (
    <PageContentBlock {...props}>
      <PageContentBlockHeaderWithDialogAction
        title={headerTitle}
        onDialogOpen={onDialogOpen}
        onDialogClose={onDialogClose}
        expanded={expanded}
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {isMobile ? (
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
          containerProps={{ sx: { flexGrow: isMobile ? 1 : undefined, marginLeft: 'auto' } }}
          inlineTerms
        />
      </Box>
      {templates && (
        <ScrollableCardsLayoutContainer minHeight={0} orientation={expanded ? 'vertical' : undefined} sameHeight>
          {templates.map(({ template, innovationPack }) => (
            <TemplateCard
              key={template.id}
              template={template}
              innovationPack={innovationPack}
              onClick={() => onClick(template)}
            />
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