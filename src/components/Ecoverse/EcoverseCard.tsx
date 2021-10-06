import { Box } from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';
import * as React from 'react';
import { FC } from 'react';
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

// todo: unify in one card props
interface EcoverseCardProps {
  id: string | number;
  displayName?: string;
  url: string;
  activity: Pick<Nvp, 'name' | 'value'>[];
  isMember: boolean;
  context: {
    tagline: string;
    visual: {
      background: string;
    };
  };
  authorization: {
    anonymousReadAccess: boolean;
  };
  tags: string[];
}

const useCardStyles = createStyles(theme => ({
  relative: {
    position: 'relative',
    flexGrow: 1,
    display: 'flex',
  },
  card: {
    marginTop: 0,
    border: `1px solid ${theme.palette.neutralMedium.main}`,
    height: 470,
  },
  content: {
    height: '270px',
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

// todo: extract cards to a base component
export const EcoverseCard: FC<EcoverseCardProps> = ({
  displayName,
  context,
  url,
  authorization,
  activity,
  tags,
  isMember,
}) => {
  const { t } = useTranslation();
  const styles = useCardStyles();
  const { tagline, visual } = context;
  const { anonymousReadAccess } = authorization;

  const getCardTags = (isMember: boolean, readAccess: boolean) => {
    if (isMember) {
      return { text: t('components.card.member') };
    } else if (!readAccess) {
      return { text: t('components.card.private') };
    } else {
      return undefined;
    }
  };

  const cardTags = getCardTags(isMember, anonymousReadAccess);

  return (
    <div className={styles.relative}>
      <Card
        className={styles.card}
        classes={{
          background: theme =>
            visual.background
              ? `url("${visual.background}") no-repeat center center / cover`
              : theme.palette.neutral.main,
        }}
        bodyProps={{
          classes: {
            background: theme => hexToRGBA(theme.palette.neutral.main, 0.4),
          },
        }}
        primaryTextProps={{
          text: displayName || '',
          tooltip: true,
          classes: {
            color: theme => theme.palette.neutralLight.main,
          },
        }}
        sectionProps={{
          children: (
            <Box display={'flex'} flexDirection={'column'}>
              <Activities
                items={[
                  {
                    name: t('pages.activity.challenges'),
                    digit: getActivityCount(activity, 'challenges') || 0,
                    color: 'primary',
                  },
                  {
                    name: t('pages.activity.opportunities'),
                    digit: getActivityCount(activity, 'opportunities') || 0,
                    color: 'primary',
                  },
                  {
                    name: t('pages.activity.members'),
                    digit: getActivityCount(activity, 'members') || 0,
                    color: 'positive',
                  },
                ]}
              />
              <CardTags tags={tags} />
            </Box>
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

export default EcoverseCard;
