import { GridLegacy, Link } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { BlockSectionTitle } from '@/core/ui/typography';
import ContributorCardSquare, {
  type ContributorCardSquareProps,
} from '@/domain/community/contributor/ContributorCardSquare/ContributorCardSquare';

const ASSOCIATE_CARDS_COUNT = 12;

type AssociatesViewProps = {
  canReadUsers: boolean;
  associates: ContributorCardSquareProps[];
  totalCount: number;
  count?: number;
};

export const AssociatesView = ({
  canReadUsers,
  associates,
  totalCount,
  count = ASSOCIATE_CARDS_COUNT,
}: AssociatesViewProps) => {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const toggleShowAll = () => setShowAll(prevValue => !prevValue);
  const usersCount = associates.length - count;

  const associatesToShow = showAll ? associates : associates.slice(0, count);

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={t('components.associates.title', { count: totalCount })} />

      <GridLegacy container={true} spacing={2} columns={{ xs: 4, sm: 8 }}>
        {canReadUsers ? (
          <>
            {associatesToShow.map(associate => (
              <GridLegacy key={associate.id} item={true} xs={2}>
                <ContributorCardSquare {...associate} />
              </GridLegacy>
            ))}
            <GridLegacy item={true} container={true} justifyContent="flex-end">
              {usersCount > 0 && (
                <Link component="button" onClick={toggleShowAll}>
                  {!showAll && t('associates-view.more', { count: usersCount })}
                  {showAll && t('associates-view.less')}
                </Link>
              )}
            </GridLegacy>
          </>
        ) : (
          <GridLegacy item={true}>
            <BlockSectionTitle>{t('associates-view.sign-in')}</BlockSectionTitle>
          </GridLegacy>
        )}
      </GridLegacy>
    </PageContentBlock>
  );
};

export default AssociatesView;
