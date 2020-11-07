import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Theme } from '../../context/ThemeProvider';
import { Opportunity } from '../../generated/graphql';
import { createStyles } from '../../hooks/useTheme';
import Button from '../core/Button';
import Card from '../core/Card';
import CircleTag from '../core/CircleTag';
import Typography from '../core/Typography';

const useCardStyles = createStyles(theme => ({
  item: {
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: theme.shape.spacing(2),
  },
  description: {
    flexGrow: 1,
    display: 'flex',
    minWidth: 0,

    '& > span': {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    },
  },
}));

export const ActivityCard: FC = () => {
  const styles = useCardStyles();

  return (
    <Card
      bodyProps={{
        classes: {
          background: (theme: Theme) => theme.palette.background,
        },
      }}
      primaryTextProps={{ text: 'challenge activity' }}
    >
      <div className={styles.item}>
        <Typography>Opportunities:</Typography>
        <div style={{ flexGrow: 1 }}></div>
        <CircleTag text={'94'} color="primary" />
      </div>
      <div className={styles.item}>
        <Typography>Projects:</Typography>
        <div style={{ flexGrow: 1 }}></div>
        <CircleTag text={'118'} color="positive" />
      </div>
      <div className={styles.item}>
        <Typography>Members:</Typography>
        <div style={{ flexGrow: 1 }}></div>
        <CircleTag text={'6171'} color="neutralMedium" />
      </div>
    </Card>
  );
};

interface Tag {
  status: string;
  text: string;
}

interface OpportunityCardProps extends Opportunity {
  url: string;
}

export const OpportunityCard: FC<OpportunityCardProps> = ({ name, url }) => {
  return (
    <Card
      bodyProps={{
        classes: {
          background: (theme: Theme) => theme.palette.primary,
        },
      }}
      headerProps={{
        text: 'Team',
      }}
      primaryTextProps={{
        text: name,
        classes: {
          color: (theme: Theme) => theme.palette.neutralLight,
        },
      }}
    >
      <div className="flex-grow-1"></div>
      <div>
        <Button text="Project details" as={Link} to={url} />
      </div>
    </Card>
  );
};
