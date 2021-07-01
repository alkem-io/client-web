import { FC, useMemo } from 'react';
import { createStyles } from '../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import Card from '../core/Card';
import * as React from 'react';
import { Theme } from '../../context/ThemeProvider';
import hexToRGBA from '../../utils/hexToRGBA';
import Typography from '../core/Typography';
import Button from '../core/Button';
import { Link } from 'react-router-dom';
import { Activities } from '../ActivityPanel';
import TagContainer from '../core/TagContainer';
import Tag from '../core/Tag';
import ReactTooltip from 'react-tooltip';
import getActivityCount from '../../utils/get-activity-count';
import { Nvp } from '../../types/graphql-schema';

interface EcoverseCardProps {
  id: string | number;
  name?: string;
  url: string;
  activity: Pick<Nvp, 'name' | 'value'>[];
  context: {
    tag: string;
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
    filter: 'drop-shadow(0px 0px 5px #3c3c3c)',
    // transition: 'all 3s ease-in',
    marginTop: 0,
    transition: 'margin 0.5s',
    '&:hover': {
      // backgroundSize: '150% 150%',
      marginTop: -theme.shape.spacing(0.5),
    },
    border: `1px solid ${theme.palette.neutralMedium}`,
    height: 400,
  },
  body: {
    height: 150,
  },
  content: {
    background: theme.palette.background,
    flexGrow: 6,
    padding: theme.shape.spacing(2),
  },
  footer: {
    background: theme.palette.neutralLight,
    padding: theme.shape.spacing(2),
  },
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
}));

// todo: extract cards to a base component
export const EcoverseCard: FC<EcoverseCardProps> = ({ name, context, url, authorization, activity, tags }) => {
  const { t } = useTranslation();
  const styles = useCardStyles();
  const { tagline, visual } = context;
  const { anonymousReadAccess } = authorization;
  const tagProps = !anonymousReadAccess ? { text: 'Private' } : undefined;
  const truncatedTags = useMemo(() => tags.slice(0, 3), [tags]);

  return (
    <div className={styles.relative}>
      <Card
        className={styles.card}
        classes={{
          background: (theme: Theme) =>
            visual.background ? `url("${visual.background}") no-repeat center center / cover` : theme.palette.neutral,
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
            lineHeight: '36px',
          },
        }}
        sectionProps={{
          children: (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h5" color="neutral">
                {'Description about the ecoverse truncated of course if its is too long...'}
              </Typography>
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
                  <span data-tip data-for="tagInfo">
                    <Tag text={<>{`+ ${tags.length - truncatedTags.length} more`}</>} color="neutralMedium" />
                  </span>
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
        tagProps={tagProps}
      >
        <Typography color="neutralLight" className={styles.description}>
          <span>{tagline}</span>
        </Typography>
      </Card>
      {tags.length > 0 && (
        <ReactTooltip id="tagInfo" effect="solid" place="right" type="info">
          <span>{tags.slice(3).join(', ')}</span>
        </ReactTooltip>
      )}
    </div>
  );
};

export default EcoverseCard;
