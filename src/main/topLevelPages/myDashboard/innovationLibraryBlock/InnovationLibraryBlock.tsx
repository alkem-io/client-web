import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useInnovationLibraryBlockQuery } from '../../../../core/apollo/generated/apollo-hooks';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import SeeMore from '../../../../core/ui/content/SeeMore';
import { Box } from '@mui/material';
import InnovationPackCard from '../../../../domain/collaboration/InnovationPack/InnovationPackCard/InnovationPackCard';
import useInnovationPackCardProps from '../../../../domain/collaboration/InnovationPack/DashboardInnovationPacks/useInnovationPackCardProps';
import { gutters } from '../../../../core/ui/grid/utils';
import ContributeCardSkeleton from '../../../../core/ui/card/ContributeCardSkeleton';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import { CONTRIBUTE_CARD_COLUMNS } from '../../../../core/ui/card/ContributeCard';
import { useColumns } from '../../../../core/ui/grid/GridContext';

interface InnovationLibraryBlockProps {
  halfWidth?: boolean;
}

const InnovationLibraryBlock: FC<InnovationLibraryBlockProps> = ({ halfWidth }) => {
  const { t } = useTranslation();
  const { data, loading } = useInnovationLibraryBlockQuery();
  const innovationPacks = useInnovationPackCardProps(data?.platform.library.innovationPacks);
  const innovationPack = innovationPacks && innovationPacks.length > 0 ? innovationPacks[0] : undefined;
  const isMobile = useColumns() <= 4;

  if (!loading && !innovationPack) {
    return null;
  }

  return (
    <PageContentBlock halfWidth={halfWidth}>
      <PageContentBlockHeader title={t('pages.home.sections.innovationLibraryBlock.title')} />
      <Box display="flex" gap={gutters()} flexWrap={isMobile ? 'wrap' : 'nowrap'} justifyContent="center">
        <GridProvider columns={CONTRIBUTE_CARD_COLUMNS} force>
          {loading && <ContributeCardSkeleton />}
          {!loading && innovationPack && <InnovationPackCard columns={2} {...innovationPack} />}
        </GridProvider>
      </Box>
      <SeeMore label="pages.home.sections.innovationLibraryBlock.seeMore" to="/innovation-library" />
    </PageContentBlock>
  );
};

export default InnovationLibraryBlock;
