import { Box } from '@material-ui/core';
import { ReactComponent as HourglassIcon } from 'bootstrap-icons/icons/hourglass.svg';
import { ReactComponent as PlusIcon } from 'bootstrap-icons/icons/plus.svg';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { createStyles } from '../../hooks/useTheme';
import Button from '../core/Button';
import Card from '../core/Card';
import Icon from '../core/Icon';
import Typography from '../core/Typography';

const useCardStyles = createStyles(theme => ({
  item: {
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: theme.spacing(2),
  },
  description: {
    flexGrow: 1,
    display: 'flex',
    minWidth: 0,

    '& > span': {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      maxHeight: '6em',
    },
  },
  card: {
    marginTop: 0,
    border: `1px solid ${theme.palette.neutralMedium.main}`,
    height: 400,
  },
  body: {
    height: 150,
  },
  content: {
    height: '225px',
    background: theme.palette.background.paper,
    padding: theme.spacing(2),
  },
  footer: {
    background: theme.palette.neutralLight.main,
    padding: theme.spacing(2),
  },
  tagline: {
    flexGrow: 1,
    display: 'flex',
    minWidth: 0,
  },
}));

interface ProjectCardProps extends Record<string, unknown> {
  caption?: string;
  title: string;
  description?: string;
  tag?: {
    status: string;
    text: string;
  };
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
  const { t } = useTranslation();
  const styles = useCardStyles();
  const headerProps = caption ? { text: caption } : undefined;

  return (
    <Card
      bodyProps={{
        classes: {
          background: theme => theme.palette.neutralLight.main,
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
          <Box display={'flex'} flexDirection={'column'} flexGrow={1}>
            <Typography as={'p'} clamp={3}>
              {description}
            </Typography>

            <Box flexGrow={1}></Box>
            <div>
              <Button text={t('buttons.details')} onClick={onSelect} />
            </div>
          </Box>
        </>
      )}
      {blank && <>{children}</>}
    </Card>
  );
};

const useAdditionalCardStyles = createStyles(theme => ({
  activeCard: {
    color: theme.palette.primary.main,

    '&:hover': {
      opacity: 0.7,
      cursor: 'pointer',
      background: theme.palette.primary.main,
      color: theme.palette.background.paper,

      '& > .alkemio-card-body': {
        background: 'transparent',
        color: theme.palette.background.paper,
      },
    },
  },
}));

export const MoreProjectsCard: FC<ProjectCardProps> = ({ title }) => {
  return (
    <ProjectCard title={title} blank>
      <Box display={'flex'} flexGrow={1} flexDirection={'column-reverse'}>
        <Icon component={HourglassIcon} color="primary" size="xl" />
      </Box>
    </ProjectCard>
  );
};

export const AddProjectsCard: FC<ProjectCardProps> = ({ onSelect, title }) => {
  const styles = useAdditionalCardStyles();

  return (
    <ProjectCard title={title} blank onClick={onSelect} className={styles.activeCard}>
      <Box display={'flex'} flexGrow={1} alignItems={'center'} justifyContent={'center'}>
        <Icon component={PlusIcon} color="inherit" size="xxl" />
      </Box>
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
