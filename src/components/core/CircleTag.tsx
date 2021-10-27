import clsx from 'clsx';
import React from 'react';
import { createStyles } from '../../hooks/useTheme';
import Typography from './Typography';

const useCircleTagStyles = createStyles(theme => ({
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
    lineHeight: '20px', // - 2 * 2 borders
    width: '100%',
  },
  small: {
    width: 22,
    height: 22,
  },
  large: {
    width: 36,
    height: 36,
  },
}));

interface TagProps extends React.SVGProps<SVGSVGElement> {
  color?: 'positive' | 'neutral' | 'primary' | 'neutralMedium'; //keyof Palette
  text: string;
  className?: string;
  size?: 'small' | 'large'; // TODO [ATS]: Make it compatibile with MUI.
}

const CircleTag: React.FC<TagProps> = ({ text, color = 'neutral', className, size = 'large' }): JSX.Element | null => {
  const styles = useCircleTagStyles();

  return (
    <span className={clsx(styles.tag, styles[color], styles[size], className)}>
      <Typography
        variant="body"
        color="inherit"
        weight={size === 'small' ? 'regular' : 'bold'}
        className={styles[`tagText-${size}`]}
      >
        {text}
      </Typography>
    </span>
  );
};

export default CircleTag;
