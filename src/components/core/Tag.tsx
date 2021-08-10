import clsx from 'clsx';
import React from 'react';
import { createStyles } from '../../hooks/useTheme';
import Typography from './Typography';

const useIconStyles = createStyles(theme => ({
  tag: {
    padding: `${theme.spacing(0.7)}px ${theme.spacing(1.4)}px`,
    display: 'inline-flex',
  },
  primary: {
    background: theme.palette.primary.main,
    color: theme.palette.neutralLight.main,
  },
  positive: {
    background: theme.palette.positive.main,
    color: theme.palette.neutralLight.main,
  },
  neutralMedium: {
    background: theme.palette.neutralMedium.main,
    color: theme.palette.background.paper,
  },
  neutral: {
    background: theme.palette.neutral.main,
    color: theme.palette.background.paper,
  },
  negative: {
    background: theme.palette.negative.main,
    color: theme.palette.background.paper,
  },
  background: {
    background: theme.palette.background.paper,
    color: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
  },
}));

export interface TagProps extends React.SVGProps<SVGSVGElement> {
  color?: 'positive' | 'neutralMedium' | 'primary' | 'neutral' | 'negative' | 'background'; //keyof Palette
  text: string | React.ReactNode;
  className?: string;
  actions?: number | undefined;
}

const Tag: React.FC<TagProps> = ({ text, className, color = 'positive' }): JSX.Element | null => {
  const styles = useIconStyles();

  return (
    <span className={clsx(styles.tag, styles[color], className)}>
      <Typography variant="caption" color="inherit" clamp={1}>
        {text}
      </Typography>
    </span>
  );
};

export default Tag;
