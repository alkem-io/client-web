import { Card, CardContent, CardHeader, createStyles, Grid, makeStyles, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { ContributionCard } from '../../components/composite/common/cards';
import HelpButton from '../../components/core/HelpButton';
import ContributionDetailsContainer from '../../containers/ContributionDetails/ContributionDetailsContainer';
import { ContributionItem } from '../../models/entities/contribution';

export interface ContributionViewProps {
  title: string;
  helpText?: string;
  contributions: ContributionItem[];
}

const useStyles = makeStyles(theme =>
  createStyles({
    card: {
      background: theme.palette.neutralLight.main,
    },
    cardHeader: {
      paddingBottom: theme.spacing(1),
    },
    cardContent: {
      paddingTop: theme.spacing(1),
    },
  })
);

export const ContributionsView: FC<ContributionViewProps> = ({ title, helpText, contributions }) => {
  const styles = useStyles();

  return (
    <Card elevation={0} className={styles.card} square>
      <CardHeader
        className={styles.cardHeader}
        title={
          <Typography variant="h3">
            {title}
            {helpText && <HelpButton helpText={helpText} />}
          </Typography>
        }
      />
      <CardContent className={styles.cardContent}>
        <Grid container spacing={2}>
          {contributions.map((x, i) => (
            <Grid item key={i}>
              <ContributionDetailsContainer entities={x}>
                {(entities, state) => <ContributionCard details={entities.details} loading={state.loading} />}
              </ContributionDetailsContainer>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};
export default ContributionsView;
