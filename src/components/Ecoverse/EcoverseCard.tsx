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
  url: string;
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
      overflow: 'hidden',
      maxHeight: '6em',
    },
  },
}));

// todo: extract cards to a base component
export const EcoverseCard: FC<EcoverseCardProps> = ({ name, context, url, authorization }) => {
  const { t } = useTranslation();
  const styles = useCardStyles();
  const { tagline, visual } = context;
  const { anonymousReadAccess } = authorization;
  const tagProps = !anonymousReadAccess ? { text: 'Private' } : undefined;

  return (
    <Card
      classes={{
        background: (theme: Theme) =>
          visual.background ? `url("${visual.background}") no-repeat center center / cover` : theme.palette.neutral,
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
