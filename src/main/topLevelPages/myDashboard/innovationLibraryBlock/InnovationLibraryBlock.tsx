import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useInnovationLibraryBlockQuery } from '../../../../core/apollo/generated/apollo-hooks';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import SeeMore from '../../../../core/ui/content/SeeMore';
import { Caption } from '../../../../core/ui/typography';
import { Box, useTheme } from '@mui/material';
import InnovationPackCard from '../../../../domain/collaboration/InnovationPack/InnovationPackCard/InnovationPackCard';
import useInnovationPackCardProps from '../../../../domain/collaboration/InnovationPack/DashboardInnovationPacks/useInnovationPackCardProps';
import { gutters } from '../../../../core/ui/grid/utils';
import ContributeCardSkeleton from '../../../../core/ui/card/ContributeCardSkeleton';

interface InnovationLibraryBlockProps {}

const InnovationLibraryBlock: FC<InnovationLibraryBlockProps> = () => {
  const { t } = useTranslation();
  const { data, loading } = useInnovationLibraryBlockQuery();
  const innovationPacks = useInnovationPackCardProps(data?.platform.library.innovationPacks);
  const innovationPack = innovationPacks && innovationPacks.length > 0 ? innovationPacks[0] : undefined;
  const theme = useTheme();

  if (!loading && !innovationPack) {
    return null;
  }

  return (
    <PageContentBlock columns={4}>
      <PageContentBlockHeader title={t('pages.home.sections.innovationLibraryBlock.title')} />
      <Box display="flex" gap={gutters()} sx={{ [theme.breakpoints.only('xs')]: { flexWrap: 'wrap' } }}>
        {loading && <ContributeCardSkeleton columns={2.5} />}
        {!loading && innovationPack && <InnovationPackCard columns={2.5} {...innovationPack} />}
        <Caption>{t('pages.home.sections.innovationLibraryBlock.description')}</Caption>
      </Box>
      <SeeMore label="pages.home.sections.innovationLibraryBlock.seeMore" to="/innovation-library" />
    </PageContentBlock>
  );
};

export default InnovationLibraryBlock;
