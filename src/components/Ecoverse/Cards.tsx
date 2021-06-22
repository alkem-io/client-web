import { ReactComponent as HourglassIcon } from 'bootstrap-icons/icons/hourglass.svg';
import { ReactComponent as PlusIcon } from 'bootstrap-icons/icons/plus.svg';
import clsx from 'clsx';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Theme } from '../../context/ThemeProvider';
import { createStyles } from '../../hooks/useTheme';
import hexToRGBA from '../../utils/hexToRGBA';
import Button from '../core/Button';
import Card from '../core/Card';
import Icon from '../core/Icon';
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

interface ChallengeCardProps {
  id: string | number;
  name?: string;
  context?: {
    tag: string;
    tagline: string;
    references?: { name: string; uri: string }[];
    visual?: {
      background: string;
    };
  };
  url: string;
}

export const ChallengeCard: FC<ChallengeCardProps> = ({ name, context = {}, url }) => {
  const { t } = useTranslation();
  const styles = useCardStyles();
  const { tag, tagline, visual } = context;
  const tagProps = tag
    ? {
        text: tag || '',
      }
    : undefined;
  const backgroundImg = visual?.background;

  return (
    <Card
      classes={{
        background: (theme: Theme) =>
          backgroundImg ? `url("${backgroundImg}") no-repeat center center / cover` : theme.palette.neutral,
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
        <Button text={t('buttons.explore')} as={Link} to={url} />
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
