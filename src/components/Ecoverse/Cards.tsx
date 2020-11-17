import clsx from 'clsx';
import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Theme } from '../../context/ThemeProvider';
import { createStyles } from '../../hooks/useTheme';
import hexToRGBA from '../../utils/hexToRGBA';
import Button from '../core/Button';
import Card from '../core/Card';
import CircleTag from '../core/CircleTag';
import Typography from '../core/Typography';
import { ReactComponent as HourglassIcon } from 'bootstrap-icons/icons/hourglass.svg';
import { ReactComponent as PlusIcon } from 'bootstrap-icons/icons/plus.svg';
import Icon from '../core/Icon';

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
  name?: string;
  context?: {
    tag: string;
    tagline: string;
    references?: { name: string; uri: string }[];
  };
  url: string;
}

export const ChallengeCard: FC<ChallengeCardProps> = ({ name, context = {}, url }) => {
  const styles = useCardStyles();
  const { tag, tagline, references } = context;
  const tagProps = tag
    ? {
        text: tag || '',
      }
    : undefined;
  const visual = references?.find(x => x.name === 'visual');

  return (
    <Card
      classes={{
        background: (theme: Theme) =>
          visual ? `url("${visual.uri}") no-repeat center center / cover` : theme.palette.neutral,
      }}
      bodyProps={{
        classes: {
          background: (theme: Theme) => hexToRGBA(theme.palette.neutral, 0.7),
        },
      }}
      primaryTextProps={{
        text: name || '',
        classes: {
          color: (theme: Theme) => theme.palette.neutralLight,
          lineHeight: '36px',
        },
      }}
      tagProps={tagProps}
    >
      <Typography color="neutralLight" className={styles.description}>
        <span>{tagline}</span>
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

interface ProjectCardProps extends Record<string, unknown> {
  caption?: string;
  title: string;
  description?: string;
  tag?: Tag;
  blank?: boolean;
  onSelect?: () => void;
  children?: React.ReactNode;
}

export const ProjectCard: FC<ProjectCardProps> = ({
  caption,
  title,
  tag,
  description,
  blank = false,
  children,
  onSelect,
  ...rest
}) => {
  const styles = useCardStyles();
  const headerProps = caption ? { text: caption } : undefined;

  return (
    <Card
      bodyProps={{
        classes: {
          background: (theme: Theme) => theme.palette.neutralLight,
        },
      }}
      headerProps={headerProps}
      primaryTextProps={{
        text: title,
        classes: {
          lineHeight: '36px',
        },
      }}
      {...rest}
    >
      {!blank && (
        <>
          {tag && (
            <Typography
              color={tag.status === 'positive' ? 'positive' : 'negative'}
              variant="caption"
              className={styles.description}
            >
              <span>{tag.text}</span>
            </Typography>
          )}
          <div className={clsx('d-flex', 'flex-column', 'flex-grow-1')}>
            <Typography as={'p'} clamp={3}>
              {description}
            </Typography>
            <div className="flex-grow-1"></div>
            <div>
              <Button text="Project details" onClick={onSelect} />
            </div>
          </div>
        </>
      )}
      {blank && <>{children}</>}
    </Card>
  );
};

const useAdditionalCardStyles = createStyles(theme => ({
  activeCard: {
    color: theme.palette.primary,

    '&:hover': {
      opacity: 0.7,
      cursor: 'pointer',
      background: theme.palette.primary,
      color: theme.palette.background,

      '& > .ct-card-body': {
        background: 'transparent',
        color: theme.palette.background,
      },
    },
  },
}));

export const MoreProjectsCard: FC<ProjectCardProps> = ({ title }) => {
  return (
    <ProjectCard title={title} blank>
      <div className={clsx('d-flex')} style={{ flexGrow: 1, flexDirection: 'column-reverse' }}>
        <Icon component={HourglassIcon} color="primary" size="xl"></Icon>
      </div>
    </ProjectCard>
  );
};

export const AddProjectsCard: FC<ProjectCardProps> = ({ onSelect, title }) => {
  const styles = useAdditionalCardStyles();

  return (
    <ProjectCard title={title} blank onClick={onSelect} className={styles.activeCard}>
      <div className={clsx('d-flex')} style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Icon component={PlusIcon} color="inherit" size="xxl"></Icon>
      </div>
    </ProjectCard>
  );
};

export const SwitchCardComponent = ({ type }) => {
  switch (type) {
    case 'more':
      return MoreProjectsCard;
    case 'add':
      return AddProjectsCard;
    case 'display':
      return ProjectCard;
    default:
      return ProjectCard;
  }
};
