import clsx from 'clsx';
import React from 'react';
import { createStyles } from '../../hooks/useTheme';
import Typography from './Typography';

const useIconStyles = createStyles(theme => ({
  tag: {
    padding: `${theme.shape.spacing(0.7)}px ${theme.shape.spacing(1.4)}px`,
    display: 'inline-flex',
  },
  primary: {
    background: theme.palette.primary,
    color: theme.palette.neutralLight,
  },
  positive: {
    background: theme.palette.positive,
    color: theme.palette.neutralLight,
  },
  neutralMedium: {
    background: theme.palette.neutralMedium,
    color: theme.palette.background,
  },
  neutral: {
    background: theme.palette.neutral,
    color: theme.palette.background,
  },
  negative: {
    background: theme.palette.negative,
    color: theme.palette.background,
  },
  background: {
    background: theme.palette.background,
    color: theme.palette.primary,
    border: `1px solid ${theme.palette.primary}`,
  },
}));

export interface TagProps extends React.SVGProps<SVGSVGElement> {
  color?: 'positive' | 'neutralMedium' | 'primary' | 'neutral' | 'negative' | 'background'; //keyof Palette
  text: string;
  className?: string;
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
