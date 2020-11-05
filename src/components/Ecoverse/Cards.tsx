import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Theme } from '../../context/ThemeProvider';
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
          padding: (theme: Theme, { xs, sm, md }) => {
            return xs || sm || md ? `${theme.shape.spacing(2)}px` : `0 ${theme.shape.spacing(4)}px 0 0`;
          },
          background: (theme: Theme) => theme.palette.background,
        },
      }}
      primaryTextProps={{ text: 'ecoverse activity' }}
    >
      <div className={styles.item}>
        <Typography>Challenges:</Typography>
        <div style={{ flexGrow: 1 }}></div>
        <CircleTag text={'21'} />
      </div>
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

interface ChallengeCardProps {
  id: string | number;
  text: string;
  tag?: string;
  description?: string;
  url: string;
}

export const ChallengeCard: FC<ChallengeCardProps> = ({ text, tag, description, url }) => {
  const styles = useCardStyles();
  const tagProps = tag
    ? {
        text: tag || '',
      }
    : undefined;

  return (
    <Card
      bodyProps={{
        classes: {
          background: (theme: Theme) => theme.palette.neutral,
        },
      }}
      primaryTextProps={{
        text: text,
        classes: {
          color: (theme: Theme) => theme.palette.neutralLight,
          lineHeight: '36px',
        },
      }}
      tagProps={tagProps}
    >
      <Typography color="neutralLight" className={styles.description}>
        <span>{description}</span>
      </Typography>
      <div>
        <Button text="Explore" as={Link} to={url} />
      </div>
    </Card>
  );
};

interface Tag {
  status: string;
  text: string;
}

interface ProjectCardProps {
  caption: string;
  title: string;
  tag: Tag;
}

export const ProjectCard: FC<ProjectCardProps> = ({ caption, title, tag }) => {
  const styles = useCardStyles();

  return (
    <Card
      bodyProps={{
        classes: {
          background: (theme: Theme) => theme.palette.neutralLight,
        },
      }}
      headerProps={{
        text: caption,
      }}
      primaryTextProps={{
        text: title,
        classes: {
          lineHeight: '36px',
        },
      }}
    >
      <Typography
        color={tag.status === 'positive' ? 'positive' : 'negative'}
        variant="caption"
        className={styles.description}
      >
        <span>{tag.text}</span>
      </Typography>
      <div>
        <Button text="Project details" onClick={() => alert('Project details: ' + title)} />
      </div>
    </Card>
  );
};
