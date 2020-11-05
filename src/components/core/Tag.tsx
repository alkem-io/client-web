import clsx from 'clsx';
import React from 'react';
import { createStyles } from '../../hooks/useTheme';
import Typography from './Typography';

const useIconStyles = createStyles(theme => ({
  tag: {
    padding: `${theme.shape.spacing(0.7)}px ${theme.shape.spacing(1.4)}px`,
    display: 'inline-flex',
  },
  positive: {
    background: theme.palette.positive,
    color: theme.palette.neutralLight,
  },
  neutralMedium: {
    background: theme.palette.neutralMedium,
    color: theme.palette.background,
  },
}));

interface TagProps extends React.SVGProps<SVGSVGElement> {
  color?: 'positive' | 'neutralMedium'; //keyof Palette
  text: string;
  className: string;
}

const Tag: React.FC<TagProps> = ({ text, className, color = 'positive' }): JSX.Element | null => {
  const styles = useIconStyles();

  return (
    <span className={clsx(styles.tag, styles[color], className)}>
      <Typography variant="caption" color="inherit">
        {text}
      </Typography>
    </span>
  );
};

export default Tag;
