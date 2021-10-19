import { Card, CardContent, CardHeader, createStyles, Grid, Link, makeStyles, Tooltip } from '@material-ui/core';
import { Help } from '@material-ui/icons';
import React, { FC } from 'react';
import { AssociateCard } from '../../components/composite/common/cards/AssociateCard/AssociateCard';
import Typography from '../../components/core/Typography';

interface AssociatesViewProps {
  associates: { name: string; title: string; src: string }[];
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
  return (
    <Card elevation={0} className={styles.card}>
      <CardHeader
        title={
          <Typography variant="h3" weight="boldLight">
            Associates ({associates.length})
            <Tooltip title="Users associated with this organization" arrow placement="right">
              <Help color="primary" />
            </Tooltip>
          </Typography>
        }
      />
      <CardContent>
        <Grid item container spacing={2}>
          {associates.map((x, i) => (
            <Grid key={i} item>
              <AssociateCard name={x.name} title={x.title} avatar={x.src} />
            </Grid>
          ))}
          <Grid item container justifyContent="flex-end">
            <Link>See more</Link>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
export default AssociatesView;
