import { Card, CardContent, CardHeader, createStyles, Grid, makeStyles, Tooltip } from '@material-ui/core';
import { Help } from '@material-ui/icons';
import React, { FC } from 'react';
import { ContributinoCard } from '../../components/composite/common/cards/ContributionCard/ContributinoCard';
import Typography from '../../components/core/Typography';

interface ContributionViewProps {
  contributions: { name: string; type: string; tags: string[]; img: string }[];
}

const useStyles = makeStyles(theme =>
  createStyles({
    card: {
      background: theme.palette.neutralLight.main,
    },
  })
);

export const ContributionView: FC<ContributionViewProps> = ({ contributions }) => {
  const styles = useStyles();
  return (
    <Card elevation={0} className={styles.card}>
      <CardHeader
        title={
          <Typography variant="h3" weight="boldLight">
            Contributions
            <Tooltip
              title="Shows different challenges and opportunities you are contributing to."
              arrow
              placement="right"
            >
              <Help color="primary" />
            </Tooltip>
          </Typography>
        }
      ></CardHeader>
      <CardContent>
        <Grid container spacing={1}>
          {contributions.map((x, i) => (
            <Grid item key={i}>
              <ContributinoCard name={x.name} type={x.type} tags={x.tags} image={x.img} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};
export default ContributionView;
