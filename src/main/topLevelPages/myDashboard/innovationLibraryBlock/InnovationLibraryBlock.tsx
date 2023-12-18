import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useInnovationLibraryBlockQuery } from '../../../../core/apollo/generated/apollo-hooks';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import SeeMore from '../../../../core/ui/content/SeeMore';
import { Caption } from '../../../../core/ui/typography';
import { Box } from '@mui/material';
import InnovationPackCard from '../../../../domain/collaboration/InnovationPack/InnovationPackCard/InnovationPackCard';
import useInnovationPackCardProps from '../../../../domain/collaboration/InnovationPack/DashboardInnovationPacks/useInnovationPackCardProps';
import { gutters } from '../../../../core/ui/grid/utils';
import ContributeCardSkeleton from '../../../../core/ui/card/ContributeCardSkeleton';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import GridItem from '../../../../core/ui/grid/GridItem';
import { CONTRIBUTE_CARD_COLUMNS } from '../../../../core/ui/card/ContributeCard';
import { useColumns } from '../../../../core/ui/grid/GridContext';

const DESCRIPTION_WIDTH_COLUMNS = 2;

interface InnovationLibraryBlockProps {
  columns?: number;
}

const InnovationLibraryBlock: FC<InnovationLibraryBlockProps> = ({ columns = 4 }) => {
  const { t } = useTranslation();
  const { data, loading } = useInnovationLibraryBlockQuery();
  const innovationPacks = useInnovationPackCardProps(data?.platform.library.innovationPacks);
  const innovationPack = innovationPacks && innovationPacks.length > 0 ? innovationPacks[0] : undefined;
  const isMobile = useColumns() <= 4;

  if (!loading && !innovationPack) {
    return null;
  }

  return (
    <PageContentBlock columns={columns}>
      <PageContentBlockHeader title={t('pages.home.sections.innovationLibraryBlock.title')} />
      <Box display="flex" gap={gutters()} flexWrap={isMobile ? 'wrap' : 'nowrap'}>
        <GridProvider
          columns={isMobile ? CONTRIBUTE_CARD_COLUMNS : CONTRIBUTE_CARD_COLUMNS + DESCRIPTION_WIDTH_COLUMNS}
          force
        >
          {loading && <ContributeCardSkeleton />}
          {!loading && innovationPack && <InnovationPackCard {...innovationPack} />}
          <GridItem columns={isMobile ? CONTRIBUTE_CARD_COLUMNS : DESCRIPTION_WIDTH_COLUMNS}>
            <Caption>{t('pages.home.sections.innovationLibraryBlock.description')}</Caption>
          </GridItem>
        </GridProvider>
      </Box>
      <SeeMore label="pages.home.sections.innovationLibraryBlock.seeMore" to="/innovation-library" />
    </PageContentBlock>
  );
};

export default InnovationLibraryBlock;
