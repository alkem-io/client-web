import { Card, CardContent, CardHeader, createStyles, makeStyles, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import HelpButton from '../../../../core/HelpButton';

export interface ProfileCardProps {
  title: string;
  helpText?: string;
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

export const ProfileCard: FC<ProfileCardProps> = ({ title, helpText, children }) => {
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
      <CardContent className={styles.cardContent}>{children}</CardContent>
    </Card>
  );
};
export default ProfileCard;
