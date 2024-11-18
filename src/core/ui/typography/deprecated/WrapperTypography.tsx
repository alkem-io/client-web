import { Palette, TypographyVariant } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { FC, useMemo, useRef } from 'react';
import { replaceAll } from '@/core/utils/replaceAll';

const useTypographyStyles = makeStyles(theme => ({
  h1: {
    fontFamily: theme.typography.h1.fontFamily,
    fontSize: theme.typography.h1.fontSize,
  },
  h2: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: theme.typography.h2.fontSize,
    textTransform: 'uppercase',
    marginBottom: theme.spacing(1),
  },
  h3: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: theme.typography.h3.fontSize,
    marginBottom: theme.spacing(1),
  },
  h4: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: theme.typography.h4.fontSize,
    marginBottom: theme.spacing(1),
  },
  h5: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: theme.typography.h5.fontSize,
  },
  caption: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: theme.typography.caption.fontSize,
    textTransform: 'uppercase',
  },
  body1: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
  },
  button: {
    fontFamily: theme.typography.button.fontFamily,
    fontSize: theme.typography.button.fontSize,
    textTransform: 'uppercase',
  },
  primary: {
    color: theme.palette.primary.main,
  },
  positive: {
    color: theme.palette.positive.main,
  },
  neutral: {
    color: theme.palette.neutral.main,
  },
  neutralMedium: {
    color: theme.palette.neutralMedium.main,
  },
  neutralLight: {
    color: theme.palette.neutralLight.main,
  },
  negative: {
    color: theme.palette.negative.main,
  },
  divider: {
    color: theme.palette.divider,
  },
  background: {
    color: theme.palette.background.paper,
  },
  success: {
    color: theme.palette.success.main,
  },
  warning: {
    color: theme.palette.warning.main,
  },
  inherit: {
    color: 'inherit',
  },
}));

interface FontWeight {
  regular: number;
  medium: number;
  boldLight: number;
  bold: number;
}

export const fontWeight: FontWeight = {
  regular: 400,
  medium: 500,
  boldLight: 700,
  bold: 900,
};

interface TypographyProps {
  variant?: TypographyVariant;
  className?: string;
  color?: keyof Palette | 'inherit';
  weight?: keyof FontWeight;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as?: React.ComponentType<any> | string;
  classes?: unknown;
}

/**
 * @deprecated - use the exports of src/core/ui/typography
 * TODO remove this component after the migration to the new design is complete
 */
const WrapperTypography: FC<TypographyProps> = ({
  variant = 'body',
  color = 'neutral',
  weight = 'medium',
  as: Component = 'div',
  className,
  classes,
  children,
  ...rest
}) => {
  const styles = useTypographyStyles(classes);
  const ref = useRef();

  const removeSlashes = (string: string) => replaceAll('\\"', '"', replaceAll('\\n', '<br/>', string));

  const plainText = children as string;

  const text = useMemo(() => {
    if (children instanceof Array) {
      return children.map(c => {
        if (typeof c === 'string') return <span key={c} dangerouslySetInnerHTML={{ __html: removeSlashes(c) }} />;
        return c;
      });
    }
    if (typeof children === 'string') {
      return <span dangerouslySetInnerHTML={{ __html: removeSlashes(plainText) }} />;
    }
    return children;
  }, [children, plainText]);

  return (
    <Component
      {...rest}
      className={clsx(styles[variant], styles[color], className)}
      style={{ fontWeight: fontWeight[weight] }}
      ref={ref}
    >
      {text}
    </Component>
  );
};

export default WrapperTypography;
