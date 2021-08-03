import clsx from 'clsx';
import React, { FC, useLayoutEffect, useMemo, useRef } from 'react';
import { Palette, Typography as TypographyContract } from '../../themes';
import { createStyles } from '../../hooks/useTheme';
import _clamp from 'clamp-js';
import { replaceAll } from '../../utils/replaceAll';

const useTypographyStyles = createStyles(theme => ({
  h1: {
    fontFamily: theme.typography.h1.font,
    fontSize: theme.typography.h1.size,
  },
  h2: {
    fontFamily: theme.typography.h2.font,
    fontSize: theme.typography.h2.size,
    textTransform: 'uppercase',
    marginBottom: theme.shape.spacing(1),
  },
  h3: {
    fontFamily: theme.typography.h3.font,
    fontSize: theme.typography.h3.size,
    marginBottom: theme.shape.spacing(1),
  },
  h4: {
    fontFamily: theme.typography.h4.font,
    fontSize: theme.typography.h4.size,
    marginBottom: theme.shape.spacing(1),
  },
  h5: {
    fontFamily: theme.typography.h5.font,
    fontSize: theme.typography.h5.size,
  },
  caption: {
    fontFamily: theme.typography.caption.font,
    fontSize: theme.typography.caption.size,
    textTransform: 'uppercase',
  },
  body: {
    fontFamily: theme.typography.body.font,
    fontSize: theme.typography.body.size,
  },
  button: {
    fontFamily: theme.typography.button.font,
    fontSize: theme.typography.button.size,
    textTransform: 'uppercase',
  },
  primary: {
    color: theme.palette.primary,
  },
  positive: {
    color: theme.palette.positive,
  },
  neutral: {
    color: theme.palette.neutral,
  },
  neutralMedium: {
    color: theme.palette.neutralMedium,
  },
  neutralLight: {
    color: theme.palette.neutralLight,
  },
  negative: {
    color: theme.palette.negative,
  },
  divider: {
    color: theme.palette.divider,
  },
  background: {
    color: theme.palette.background,
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
  variant?: keyof TypographyContract;
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
