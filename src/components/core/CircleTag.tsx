import clsx from 'clsx';
import React, { ReactNode } from 'react';
import { makeStyles } from '@mui/styles';
import Typography from './Typography';

export enum CircleTagSize {
  Small = 'small',
  Large = 'large',
}

const CircleTagSizeValues = {
  [CircleTagSize.Small]: 22,
  [CircleTagSize.Large]: 36,
} as const;

export const CircleTagSizeStyles = {
  [CircleTagSize.Small]: {
    width: CircleTagSizeValues[CircleTagSize.Small],
    height: CircleTagSizeValues[CircleTagSize.Small],
  },
  [CircleTagSize.Large]: {
    width: CircleTagSizeValues[CircleTagSize.Large],
    height: CircleTagSizeValues[CircleTagSize.Large],
  },
} as const;

const useCircleTagStyles = makeStyles(theme => ({
  tag: {
    display: 'inline-flex',
    borderRadius: '50%',
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: theme.palette.background.paper,
    position: 'relative',
  },
  positive: {
    borderColor: theme.palette.positive.main,
    color: theme.palette.positive.main,
  },
  neutral: {
    borderColor: theme.palette.neutral.main,
    color: theme.palette.neutral.main,
  },
  primary: {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
  },
  neutralMedium: {
    borderColor: theme.palette.neutralMedium.main,
    color: theme.palette.neutralMedium.main,
  },
  'tagText-large': {
    textAlign: 'center',
    lineHeight: '32px', // - 2 * 2 borders
    width: '100%',
  },
  'tagText-small': {
    textAlign: 'center',
    lineHeight: '1.2rem', // - 2 * 2 borders
    width: '100%',
  },
  ...CircleTagSizeStyles,
}));

export interface CircleTagProps extends React.SVGProps<SVGSVGElement> {
  color?: 'positive' | 'neutral' | 'primary' | 'neutralMedium'; //keyof Palette
  text?: ReactNode;
  className?: string;
  size?: 'small' | 'large'; // TODO [ATS]: Make it compatibile with MUI.
}

const CircleTag: React.FC<CircleTagProps> = ({
  text,
  color = 'neutral',
  className,
  size = 'large',
  children = text,
}): JSX.Element | null => {
  const styles = useCircleTagStyles();

  return (
    <span className={clsx(styles.tag, styles[color], styles[size], className)}>
      <Typography
        variant="body1"
        color="inherit"
        weight={size === 'small' ? 'regular' : 'bold'}
        className={styles[`tagText-${size}`]}
      >
        {children}
      </Typography>
    </span>
  );
};

export default CircleTag;
