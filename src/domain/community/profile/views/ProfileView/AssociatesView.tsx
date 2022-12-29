import { Grid, Link } from '@mui/material';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContributorCard, {
  ContributorCardProps,
} from '../../../../../common/components/composite/common/cards/ContributorCard/ContributorCard';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';

const ASSOCIATE_CARDS_COUNT = 12;

interface AssociatesViewProps {
  associates: ContributorCardProps[];
  count?: number;
}

export const AssociatesView: FC<AssociatesViewProps> = ({ associates, count = ASSOCIATE_CARDS_COUNT }) => {
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
      <PageContentBlockHeader title={t('components.associates.title', { count: associates.length })} />
      <Grid container spacing={2} columns={{ xs: 6, sm: 12 }}>
        {associatesToShow.map(associate => (
          <Grid key={associate.id} item xs={2}>
            <ContributorCard {...associate} />
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
      </Grid>
    </PageContentBlock>
  );
};

export default AssociatesView;
