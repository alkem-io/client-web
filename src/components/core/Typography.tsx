import clsx from 'clsx';
import React, { FC, useLayoutEffect, useMemo, useRef } from 'react';
import _clamp from 'clamp-js';
import { Palette } from '@material-ui/core/styles/createPalette';
import { TypographyOptions } from '@material-ui/core/styles/createTypography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { replaceAll } from '../../utils/replaceAll';

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
  body: {
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

const fontWeight: FontWeight = {
  regular: 400,
  medium: 500,
  boldLight: 700,
  bold: 900,
};

interface TypographyProps extends Record<string, unknown> {
  variant?: keyof TypographyOptions;
  className?: string;
  color?: keyof Palette | 'inherit';
  weight?: keyof FontWeight;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as?: React.ComponentType<any> | string;
  classes?: unknown;
  clamp?: string | number;
}

const Typography: FC<TypographyProps> = ({
  variant = 'body',
  color = 'neutral',
  weight = 'medium',
  as: Component = 'div',
  className,
  classes,
  children,
  clamp = undefined,
  ...rest
}) => {
  const styles = useTypographyStyles(classes);
  const ref = useRef();

  useLayoutEffect(() => {
    if (clamp && ref?.current) {
      _clamp(ref.current, { clamp });
    }
  });

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
  }, [children]);

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

export default Typography;
