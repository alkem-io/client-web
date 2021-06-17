import { FC } from 'react';
import { createStyles } from '../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import Card from '../core/Card';
import * as React from 'react';
import { Theme } from '../../context/ThemeProvider';
import hexToRGBA from '../../utils/hexToRGBA';
import Typography from '../core/Typography';
import Button from '../core/Button';
import { Link } from 'react-router-dom';

interface EcoverseCardProps {
  id: string | number;
  name?: string;
  context?: {
    tag: string;
    tagline: string;
    references?: { name: string; uri: string }[];
  };
  url: string;
}

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

// todo: extract cards to a base component
export const EcoverseCard: FC<EcoverseCardProps> = ({ name, context = {}, url }) => {
  const { t } = useTranslation();
  const styles = useCardStyles();
  const { tag, tagline, references } = context;
  const visual = references?.find(x => x.name === 'visual');
  const tagProps = tag
    ? {
        text: tag || '',
      }
    : undefined;

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
        <Button text={t('buttons.explore')} as={Link} to={url} />
      </div>
    </Card>
  );
};

export default EcoverseCard;
