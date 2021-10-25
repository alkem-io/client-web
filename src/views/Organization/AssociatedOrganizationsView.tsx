import { Card, CardContent, CardHeader, createStyles, Grid, makeStyles, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import AssociatedOrganizationCard from '../../components/composite/common/cards/Organization/AssociatedOrganizationCard';
import HelpButton from '../../components/core/HelpButton';
import AssociatedOrganizationContainer from '../../containers/organization/AssociatedOrganizationContainer';

interface AssociatedOrganizationsViewProps {
  title: string;
  helpText?: string;
  organizationNameIDs: string[];
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

export const AssociatedOrganizationsView: FC<AssociatedOrganizationsViewProps> = ({
  title,
  helpText,
  organizationNameIDs,
}) => {
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
        <Grid container direction="column">
          {organizationNameIDs.map((oNameID, i) => (
            <AssociatedOrganizationContainer key={i} entities={{ organizationNameId: oNameID }}>
              {(entities, state) => (
                <Grid item>
                  <AssociatedOrganizationCard
                    name={entities.name}
                    avatar={entities.avatar}
                    information={entities.information}
                    role={entities.role}
                    members={entities.membersCount}
                    verified={entities.verified}
                    url={entities.url}
                    loading={state.loading}
                  />
                </Grid>
              )}
            </AssociatedOrganizationContainer>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};
export default AssociatedOrganizationsView;
