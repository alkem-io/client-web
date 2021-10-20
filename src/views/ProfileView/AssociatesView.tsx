import { Card, CardContent, CardHeader, createStyles, Grid, Link, makeStyles, Tooltip } from '@material-ui/core';
import { Help } from '@material-ui/icons';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { AssociateCard } from '../../components/composite/common/cards/AssociateCard/AssociateCard';
import { UserCardProps } from '../../components/composite/common/cards/user-card/UserCard';
import { RouterLink } from '../../components/core/RouterLink';
import Typography from '../../components/core/Typography';

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
    <Card elevation={0} className={styles.card}>
      <CardHeader
        title={
          <Typography variant="h3" weight="boldLight">
            {t('components.associates.title', { count: associates.length })}
            <Tooltip title={t('components.associates.help')} arrow placement="right">
              <Help color="primary" />
            </Tooltip>
          </Typography>
        }
      />
      <CardContent>
        <Grid item container spacing={2}>
          {associates.slice(0, 10).map((x, i) => (
            <Grid key={i} item>
              <AssociateCard {...x} />
            </Grid>
          ))}
          <Grid item container justifyContent="flex-end">
            <Link component={RouterLink} to="/user/search">
              {t('buttons.see-more')}
            </Link>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
export default AssociatesView;
