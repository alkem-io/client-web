import { Card, CardContent, CardHeader, createStyles, Grid, makeStyles } from '@material-ui/core';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { AssociateCard } from '../../components/composite/common/cards/AssociateCard/AssociateCard';
import { UserCardProps } from '../../components/composite/common/cards/user-card/UserCard';
import HelpButton from '../../components/core/HelpButton';
import Typography from '../../components/core/Typography';

const ASSOCIATE_CARDS_COUNT = 10;

interface AssociatesViewProps {
  associates: UserCardProps[];
}

const useStyles = makeStyles(theme =>
  createStyles({
    card: {
      background: theme.palette.neutralLight.main,
    },
  })
);

export const AssociatesView: FC<AssociatesViewProps> = ({ associates }) => {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <Card elevation={0} className={styles.card} square>
      <CardHeader
        title={
          <Typography variant="h3" weight="boldLight">
            {t('components.associates.title', { count: associates.length })}
            <HelpButton helpText={t('components.associates.help')} />
          </Typography>
        }
      />
      <CardContent>
        <Grid item container spacing={2}>
          {associates.slice(0, ASSOCIATE_CARDS_COUNT).map((x, i) => (
            <Grid key={i} item>
              <AssociateCard {...x} />
            </Grid>
          ))}
          <Grid item container justifyContent="flex-end">
            {/* Hide untill the search page is ready. */}
            {/*
            <Link component={RouterLink} to="/user/search">
              {t('buttons.see-more')}
            </Link> */}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
export default AssociatesView;
