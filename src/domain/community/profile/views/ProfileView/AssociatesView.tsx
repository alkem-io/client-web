import { Grid, Link } from '@mui/material';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContributorCardSquare, {
  ContributorCardSquareProps,
} from '../../../contributor/ContributorCardSquare/ContributorCardSquare';
import PageContentBlock from '@core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@core/ui/content/PageContentBlockHeader';
import { BlockSectionTitle } from '@core/ui/typography';

const ASSOCIATE_CARDS_COUNT = 12;

interface AssociatesViewProps {
  canReadUsers: boolean;
  associates: ContributorCardSquareProps[];
  totalCount: number;
  count?: number;
}

export const AssociatesView: FC<AssociatesViewProps> = ({
  canReadUsers,
  associates,
  totalCount,
  count = ASSOCIATE_CARDS_COUNT,
}) => {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const toggleShowAll = () => setShowAll(prevValue => !prevValue);
  const usersCount = associates.length - count;

  const associatesToShow = useMemo(
    () => (showAll ? associates : associates.slice(0, count)),
    [associates, count, showAll]
  );

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={t('components.associates.title', { count: totalCount })} />

      <Grid container spacing={2} columns={{ xs: 4, sm: 8 }}>
        {canReadUsers ? (
          <>
            {associatesToShow.map(associate => (
              <Grid key={associate.id} item xs={2}>
                <ContributorCardSquare {...associate} />
              </Grid>
            ))}
            <Grid item container justifyContent="flex-end">
              {usersCount > 0 && (
                <Link component="button" onClick={toggleShowAll}>
                  {!showAll && t('associates-view.more', { count: usersCount })}
                  {showAll && t('associates-view.less')}
                </Link>
              )}
            </Grid>
          </>
        ) : (
          <Grid item>
            <BlockSectionTitle>{t('associates-view.sign-in')}</BlockSectionTitle>
          </Grid>
        )}
      </Grid>
    </PageContentBlock>
  );
};

export default AssociatesView;
