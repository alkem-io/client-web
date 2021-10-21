import { Card, CardContent, CardHeader, createStyles, Grid, makeStyles, Tooltip } from '@material-ui/core';
import { Help } from '@material-ui/icons';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ContributionCard } from '../../components/composite/common/cards';
import Typography from '../../components/core/Typography';
import ContributionDetailsContainer from '../../containers/ContributionDetails/ContributionDetailsContainer';
import { ContributionItem } from '../../models/entities/contribution';

export interface ContributionViewProps {
  contributions: ContributionItem[];
}

const useStyles = makeStyles(theme =>
  createStyles({
    card: {
      background: theme.palette.neutralLight.main,
    },
    icon: {
      marginLeft: theme.spacing(1),
    },
  })
);

export const ContributionsView: FC<ContributionViewProps> = ({ contributions }) => {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <Card elevation={0} className={styles.card} square>
      <CardHeader
        title={
          <Typography variant="h3" weight="boldLight">
            {t('components.contributions.title')}
            <Tooltip title={t('components.contributions.help')} arrow placement="right">
              <Help color="primary" className={styles.icon} />
            </Tooltip>
          </Typography>
        }
      ></CardHeader>
      <CardContent>
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
