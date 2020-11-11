import clsx from 'clsx';
import React, { FC } from 'react';
import { createStyles } from '../../hooks/useTheme';
import hexToRGBA from '../../utils/hexToRGBA';
import Typography from './Typography';

const useButtonStyles = createStyles(theme => ({
  inputContainer: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  input: {
    padding: `${theme.shape.spacing(1)}px ${theme.shape.spacing(2)}px`,
    paddingTop: theme.shape.spacing(4),
    color: theme.palette.neutral,
    boxShadow: `inset 0px 1px 3px ${hexToRGBA(theme.palette.neutralMedium, 0.8)}`,

    border: `2px solid ${theme.palette.neutralMedium}`,
    borderRadius: theme.shape.borderRadius,
    '-webkit-transition': '.18s ease-out',
    '-moz-transition': '.18s ease-out',
    '-o-transition': '.18s ease-out',
    transition: '.18s ease-out',

    font: theme.typography.h3.font,
    fontSize: theme.typography.h3.size,
  },
  textArea: {
    padding: `${theme.shape.spacing(1)}px ${theme.shape.spacing(2)}px`,
    paddingTop: theme.shape.spacing(4),
    color: theme.palette.neutral,
    boxShadow: `inset 0px 1px 3px ${hexToRGBA(theme.palette.neutralMedium, 0.8)}`,

    border: `2px solid ${theme.palette.neutralMedium}`,
    borderRadius: theme.shape.borderRadius,
    '-webkit-transition': '.18s ease-out',
    '-moz-transition': '.18s ease-out',
    '-o-transition': '.18s ease-out',
    transition: '.18s ease-out',

    font: theme.typography.body.font,
    fontSize: theme.typography.body.size,
  },
  label: {
    position: 'absolute',
    top: theme.shape.spacing(1.5),
    left: theme.shape.spacing(2),
  },
  primary: {
    color: theme.palette.primary,

    '& > .ct-input,.ct-textarea': {
      '&:hover': {
        borderColor: theme.palette.primary,
      },
      '&:focus': {
        borderColor: theme.palette.primary,
        outline: 'none',
      },
    },
  },
  neutral: {
    color: theme.palette.neutral,
  },
  error: {
    color: theme.palette.negative,

    '& > .ct-input,.ct-textarea': {
      borderColor: theme.palette.negative,

      '&:hover': {
        borderColor: theme.palette.negative,
      },
      '&:focus': {
        borderColor: theme.palette.negative,
        outline: 'none',
      },
    },
  },
}));

interface TextProps extends Record<string, unknown> {
  className?: string;
  classes?: unknown;
  value: string;
  label: string;
  variant?: 'neutral' | 'primary' | 'transparent';
  error?: boolean;
  inset?: boolean;
  small?: boolean;
  disabled?: boolean;
}

interface TextInputProps extends TextProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextInput: FC<TextInputProps> = ({
  className,
  classes = {},
  onChange,
  value,
  label,
  variant = 'primary',
  inset = false,
  small = false,
  error = false,
  disabled = false,
  children,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ...rest
}) => {
  const styles = useButtonStyles(classes);

  // can always use the bootstrap button internally
  return (
    <div className={clsx(styles.inputContainer, styles[variant], error && styles.error)}>
      {label && (
        <Typography variant="caption" color="inherit" weight="boldLight" className={styles.label}>
          {label}
        </Typography>
      )}
      <input
        type="text"
        disabled={disabled}
        className={clsx(styles.input, inset && 'inset', small && 'small', 'ct-input', className)}
        onChange={onChange}
        value={value}
        {...rest}
      ></input>
    </div>
  );
};

interface TextAreaProps extends TextProps {
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextArea: FC<TextAreaProps> = ({
  className,
  classes = {},
  onChange,
  value,
  label,
  variant = 'primary',
  inset = false,
  small = false,
  error = false,
  disabled = false,
  children,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ...rest
}) => {
  const styles = useButtonStyles(classes);

  // can always use the bootstrap button internally
  return (
    <div className={clsx(styles.inputContainer, styles[variant], error && styles.error)}>
      {label && (
        <Typography variant="caption" color="inherit" weight="boldLight" className={styles.label}>
          {label}
        </Typography>
      )}
      <textarea
        rows={4}
        disabled={disabled}
        className={clsx(styles.textArea, inset && 'inset', small && 'small', 'ct-textarea', className)}
        onChange={onChange}
        value={value}
        {...rest}
      />
    </div>
  );
};

export default TextInput;

export { TextArea };
