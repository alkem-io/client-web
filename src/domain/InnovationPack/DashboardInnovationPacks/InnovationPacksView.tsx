import { Dispatch, ReactNode } from 'react';
import PageContentBlockHeaderWithDialogAction from '@/core/ui/content/PageContentBlockHeaderWithDialogAction';
import MultipleSelect from '@/core/ui/search/MultipleSelect';
import InnovationPackCard, { InnovationPackCardProps } from '../InnovationPackCard/InnovationPackCard';
import PageContentBlock, { PageContentBlockProps } from '@/core/ui/content/PageContentBlock';
import { Identifiable } from '@/core/utils/Identifiable';
import SeeMore from '@/core/ui/content/SeeMore';
import { useTranslation } from 'react-i18next';
import ScrollableCardsLayoutContainer from '@/core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import { Box, Button } from '@mui/material';
import { CONTRIBUTE_CARD_COLUMNS } from '@/core/ui/card/ContributeCard';
import GridItem from '@/core/ui/grid/GridItem';
import { Skeleton } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import { useTheme } from '@mui/material';
import { useScreenSize } from '@/core/ui/grid/constants';

interface InnovationPacksViewProps extends PageContentBlockProps {
  filter: string[];
  headerTitle: ReactNode;
  innovationPacks: (Identifiable & InnovationPackCardProps)[] | undefined;
  expanded?: boolean;
  onFilterChange: Dispatch<string[]>;
  onDialogOpen?: () => void;
  onDialogClose?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  id?: string;
  headerTitleId?: string;
}

const InnovationPacksView = ({
  id,
  headerTitle,
  headerTitleId,
  innovationPacks,
  filter,
  onFilterChange,
  expanded = false,
  onDialogOpen,
  onDialogClose,
  hasMore = false,
  loading,
  ...props
}: InnovationPacksViewProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isSmallScreen } = useScreenSize();

  return (
    <PageContentBlock {...props}>
      <PageContentBlockHeaderWithDialogAction
        title={headerTitle}
        titleId={headerTitleId}
        onDialogOpen={onDialogOpen}
        onDialogClose={onDialogClose}
        expanded={expanded}
        actions={<MultipleSelect onChange={onFilterChange} value={filter} minLength={2} size="xsmall" inlineTerms />}
        id={id}
      />

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
          : innovationPacks?.map(({ id, ...cardProps }) => <InnovationPackCard key={id} {...cardProps} />)}

        {isSmallScreen && hasMore && !loading && (
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

      {!isSmallScreen && hasMore && <SeeMore subject={t('common.innovation-packs')} onClick={onDialogOpen} />}
    </PageContentBlock>
  );
};

export default InnovationPacksView;
