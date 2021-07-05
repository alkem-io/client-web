import { ReactComponent as HourglassIcon } from 'bootstrap-icons/icons/hourglass.svg';
import { ReactComponent as PlusIcon } from 'bootstrap-icons/icons/plus.svg';
import clsx from 'clsx';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Theme } from '../../context/ThemeProvider';
import { createStyles } from '../../hooks/useTheme';
import hexToRGBA from '../../utils/hexToRGBA';
import Button from '../core/Button';
import Card from '../core/Card';
import Icon from '../core/Icon';
import Typography from '../core/Typography';
import { Nvp } from '../../types/graphql-schema';
import { Activities } from '../ActivityPanel';
import getActivityCount from '../../utils/get-activity-count';
import TagContainer from '../core/TagContainer';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Tag from '../core/Tag';

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
      overflow: 'hidden',
      maxHeight: '6em',
    },
  },
  card: {
    marginTop: 0,
    border: `1px solid ${theme.palette.neutralMedium}`,
    height: 400,
  },
  body: {
    height: 150,
  },
  content: {
    height: '225px',
    background: theme.palette.background,
    padding: theme.shape.spacing(2),
  },
  footer: {
    background: theme.palette.neutralLight,
    padding: theme.shape.spacing(2),
  },
  tagline: {
    flexGrow: 1,
    display: 'flex',
    minWidth: 0,
  },
}));

// todo: unify in one card props
interface ChallengeCardProps {
  id: string | number;
  name?: string;
  context?: {
    tagline: string;
    visual?: {
      background: string;
    };
  };
  isMember: boolean;
  activity: Pick<Nvp, 'name' | 'value'>[];
  tags: string[];
  url: string;
}

export const ChallengeCard: FC<ChallengeCardProps> = ({ name, context = {}, url, activity, tags, isMember }) => {
  const { t } = useTranslation();
  const styles = useCardStyles();
  const { tagline, visual } = context;

  const cardTags = isMember ? { text: t('components.card.member') } : undefined;

  const backgroundImg = visual?.background;
  const truncatedTags = useMemo(() => tags.slice(0, 3), [tags]);

  return (
    <Card
      className={styles.card}
      classes={{
        background: (theme: Theme) =>
          backgroundImg ? `url("${backgroundImg}") no-repeat center center / cover` : theme.palette.neutral,
      }}
      bodyProps={{
        classes: {
          background: (theme: Theme) => hexToRGBA(theme.palette.neutral, 0.7),
        },
        className: styles.body,
      }}
      primaryTextProps={{
        text: name || '',
        classes: {
          color: (theme: Theme) => theme.palette.neutralLight,
        },
      }}
      sectionProps={{
        children: (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Activities
              items={[
                { name: 'Challenges', digit: getActivityCount(activity, 'challenges') || 0, color: 'primary' },
                { name: 'Members', digit: getActivityCount(activity, 'members') || 0, color: 'positive' },
              ]}
            />
            <TagContainer>
              {truncatedTags.map((t, i) => (
                <Tag key={i} text={t} color="neutralMedium" />
              ))}
              {tags.length > 3 && (
                <OverlayTrigger
                  placement={'right'}
                  overlay={<Tooltip id={'more-tags'}>{tags.slice(3).join(', ')}</Tooltip>}
                >
                  <span>
                    <Tag text={<>{`+ ${tags.length - truncatedTags.length} more`}</>} color="neutralMedium" />
                  </span>
                </OverlayTrigger>
              )}
            </TagContainer>
          </div>
        ),
        className: styles.content,
      }}
      footerProps={{
        className: styles.footer,
        children: (
          <div>
            <Button text={t('buttons.explore')} as={Link} to={url} />
          </div>
        ),
      }}
      tagProps={cardTags}
    >
      {tagline && (
        <Typography color="neutralLight" className={styles.tagline} clamp={2}>
          <span>{tagline}</span>
        </Typography>
      )}
    </Card>
  );
};

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
