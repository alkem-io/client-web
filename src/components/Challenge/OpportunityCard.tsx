import Tooltip from '@material-ui/core/Tooltip';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { createStyles } from '../../hooks/useTheme';
import { Nvp } from '../../models/graphql-schema';
import getActivityCount from '../../utils/get-activity-count';
import hexToRGBA from '../../utils/hexToRGBA';
import { Activities } from '../composite/common/ActivityPanel/Activities';
import CardTags from '../composite/common/CardTags/CardTags';
import Button from '../core/Button';
import Card from '../core/Card';
import Typography from '../core/Typography';

const useCardStyles = createStyles(theme => ({
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
  relative: {
    position: 'relative',
    flexGrow: 1,
    display: 'flex',
  },
}));

interface OpportunityCardProps {
  displayName?: string;
  url: string;
  activity: Pick<Nvp, 'name' | 'value'>[];
  lifecycle: {
    state: string;
  };
  context: {
    tagline: string;
    visual: {
      background: string;
    };
  };
  tags: string[];
}

const OpportunityCard: FC<OpportunityCardProps> = ({ displayName = '', context, url, lifecycle, activity, tags }) => {
  const { t } = useTranslation();
  const styles = useCardStyles();
  const { tagline, visual } = context;

  const backgroundImg = visual?.background;
  const cardTags = lifecycle.state ? { text: t('components.card.status', { statusName: lifecycle.state }) } : undefined;

  return (
    <div className={styles.relative}>
      <Card
        className={styles.card}
        classes={{
          background: theme =>
            backgroundImg ? `url("${backgroundImg}") no-repeat center center / cover` : theme.palette.primary.main,
        }}
        bodyProps={{
          classes: {
            background: theme => hexToRGBA(theme.palette.neutral.main, 0.4),
          },
        }}
        primaryTextProps={{
          text: displayName,
          tooltip: true,
          classes: {
            color: theme => theme.palette.neutralLight.main,
          },
        }}
        sectionProps={{
          children: (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Activities
                items={[
                  { name: 'Projects', digit: getActivityCount(activity, 'projects') || 0, color: 'primary' },
                  { name: 'Members', digit: getActivityCount(activity, 'members') || 0, color: 'positive' },
                ]}
              />
              <CardTags tags={tags} />
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
          <Tooltip placement="right" title={tagline || ''} arrow>
            <div>
              <Typography color="neutralLight" className={styles.tagline} clamp={2}>
                <span>{tagline}</span>
              </Typography>
            </div>
          </Tooltip>
        )}
      </Card>
    </div>
  );
};
export default OpportunityCard;
