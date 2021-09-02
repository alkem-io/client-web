import clsx from 'clsx';
import React, { FC } from 'react';
import { createStyles } from '../../hooks/useTheme';
import Typography from './Typography';

const useButtonStyles = createStyles(theme => ({
  inputContainer: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  input: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    paddingTop: theme.spacing(4),
    color: theme.palette.neutral.main,

    border: `2px solid ${theme.palette.neutralMedium.main}`,
    borderRadius: theme.shape.borderRadius,
    '-webkit-transition': '.18s ease-out',
    '-moz-transition': '.18s ease-out',
    '-o-transition': '.18s ease-out',
    transition: '.18s ease-out',

    font: theme.typography.h3.fontFamily,
    fontSize: theme.typography.h3.fontSize,
  },
  textArea: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    paddingTop: theme.spacing(4),
    color: theme.palette.neutral.main,

    border: `2px solid ${theme.palette.neutralMedium.main}`,
    borderRadius: theme.shape.borderRadius,
    '-webkit-transition': '.18s ease-out',
    '-moz-transition': '.18s ease-out',
    '-o-transition': '.18s ease-out',
    transition: '.18s ease-out',

    font: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
  },
  label: {
    position: 'absolute',
    top: 2,
    left: theme.spacing(2),
    width: 'calc(100% - 34px)',
    margin: '0 auto',
    backgroundColor: theme.palette.background.paper,
    paddingTop: theme.spacing(1.3),
  },
  primary: {
    color: theme.palette.primary.main,

    '& > .alkemio-input,.alkemio-textarea': {
      '&:hover': {
        borderColor: theme.palette.primary.main,
      },
      '&:focus': {
        borderColor: theme.palette.primary.main,
        outline: 'none',
      },
    },
  },
  neutral: {
    color: theme.palette.neutral.main,
  },
  error: {
    color: theme.palette.negative.main,

    '& > .alkemio-input,.alkemio-textarea': {
      borderColor: theme.palette.negative.main,

      '&:hover': {
        borderColor: theme.palette.negative.main,
      },
      '&:focus': {
        borderColor: theme.palette.negative.main,
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
  ...rest
}) => {
  const styles = useButtonStyles(classes);

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
        className={clsx(styles.input, inset && 'inset', small && 'small', 'alkemio-input', className)}
        onChange={onChange}
        value={value}
        {...rest}
      />
    </div>
  );
};

interface TextAreaProps extends TextProps {
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
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
  rows = 4,
  ...rest
}) => {
  const styles = useButtonStyles(classes);

  return (
    <div className={clsx(styles.inputContainer, styles[variant], error && styles.error)}>
      {label && (
        <Typography variant="caption" color="inherit" weight="boldLight" className={styles.label}>
          {label}
        </Typography>
      )}
      <textarea
        rows={rows}
        disabled={disabled}
        className={clsx(styles.textArea, inset && 'inset', small && 'small', 'alkemio-textarea', className)}
        onChange={onChange}
        value={value}
        {...rest}
      />
    </div>
  );
};

export default TextInput;

export { TextArea };
