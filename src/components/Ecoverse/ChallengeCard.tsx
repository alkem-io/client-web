import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../core/Card';
import hexToRGBA from '../../utils/hexToRGBA';
import { Activities } from '../ActivityPanel/Activities';
import getActivityCount from '../../utils/get-activity-count';
import TagContainer from '../core/TagContainer';
import Tag from '../core/Tag';
import Button from '../core/Button';
import { Link } from 'react-router-dom';
import Typography from '../core/Typography';
import { Nvp } from '../../models/graphql-schema';
import { createStyles } from '../../hooks/useTheme';
import Tooltip from '@material-ui/core/Tooltip';

const useCardStyles = createStyles(theme => ({
  relative: {
    position: 'relative',
    flexGrow: 1,
    display: 'flex',
  },
  card: {
    marginTop: 0,
    border: `1px solid ${theme.palette.neutralMedium.main}`,
    height: 400,
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

// todo: unify in one card props
interface ChallengeCardProps {
  id: string | number;
  displayName?: string;
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

const ChallengeCard: FC<ChallengeCardProps> = ({ displayName, context = {}, url, activity, tags, isMember }) => {
  const { t } = useTranslation();
  const styles = useCardStyles();
  const { tagline, visual } = context;

  const cardTags = isMember ? { text: t('components.card.member') } : undefined;

  const backgroundImg = visual?.background;
  const truncatedTags = useMemo(() => tags.slice(0, 3), [tags]);

  return (
    <div className={styles.relative}>
      <Card
        className={styles.card}
        classes={{
          background: theme =>
            backgroundImg ? `url("${backgroundImg}") no-repeat center center / cover` : theme.palette.neutral.main,
        }}
        bodyProps={{
          classes: {
            background: theme => hexToRGBA(theme.palette.neutral.main, 0.4),
          },
        }}
        primaryTextProps={{
          text: displayName || '',
          classes: {
            color: theme => theme.palette.neutralLight.main,
          },
        }}
        sectionProps={{
          children: (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Activities
                items={[
                  { name: 'Opportunities', digit: getActivityCount(activity, 'opportunities') || 0, color: 'primary' },
                  { name: 'Members', digit: getActivityCount(activity, 'members') || 0, color: 'positive' },
                ]}
              />
              <TagContainer>
                {truncatedTags.map((t, i) => (
                  <Tag key={i} text={t} color="neutralMedium" />
                ))}
                {tags.length > 3 && (
                  <Tooltip placement="right" title={tags.slice(3).join(', ')} id="more-tags" arrow>
                    <span>
                      <Tag text={<>{`+ ${tags.length - truncatedTags.length} more`}</>} color="neutralMedium" />
                    </span>
                  </Tooltip>
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
    </div>
  );
};

export default ChallengeCard;
