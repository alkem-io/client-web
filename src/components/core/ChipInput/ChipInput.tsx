import {
  FilledInput,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  OutlinedInput,
  withStyles,
} from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';

const variantComponent = {
  standard: Input,
  filled: FilledInput,
  outlined: OutlinedInput,
};

export const styles = {
  /* Styles applied to the root element. */
  root: {},
};
// type ChipInputProps = StandardTextFieldProps | FilledTextFieldProps | OutlinedTextFieldProps;

const ChipInput: React.FC<any> = React.forwardRef(function ChipInput(props, ref) {
  const {
    autoComplete,
    autoFocus = false,
    children,
    classes,
    className,
    color = 'primary',
    defaultValue,
    disabled = false,
    error = false,
    FormHelperTextProps,
    fullWidth = false,
    helperText,
    hiddenLabel,
    id,
    InputLabelProps,
    inputProps,
    InputProps,
    inputRef,
    label,
    multiline = false,
    name,
    onBlur,
    onChange,
    onFocus,
    placeholder,
    required = false,
    rows,
    rowsMax,
    maxRows,
    minRows,
    select = false,
    SelectProps,
    type,
    value,
    variant = 'standard',
    ...other
  } = props;

  if (process.env.NODE_ENV !== 'production') {
    if (select && !children) {
      console.error('Material-UI: `children` must be passed when using the `ChipInput` component with `select`.');
    }
  }

  const InputMore: Record<string, unknown> = {};

  if (variant === 'outlined') {
    if (InputLabelProps && typeof InputLabelProps.shrink !== 'undefined') {
      InputMore.notched = InputLabelProps.shrink;
    }
    if (label) {
      const displayRequired = InputLabelProps?.required ?? required;
      InputMore.label = (
        <React.Fragment>
          {label}
          {displayRequired && '\u00a0*'}
        </React.Fragment>
      );
    }
  }
  if (select) {
    // unset defaults from textbox inputs
    if (!SelectProps || !SelectProps.native) {
      InputMore.id = undefined;
    }
    InputMore['aria-describedby'] = undefined;
  }

  const helperTextId = helperText && id ? `${id}-helper-text` : undefined;
  const inputLabelId = label && id ? `${id}-label` : undefined;
  const InputComponent = variantComponent[variant];
  const InputElement = (
    <InputComponent
      aria-describedby={helperTextId}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      defaultValue={defaultValue}
      fullWidth={fullWidth}
      multiline={multiline}
      name={name}
      rows={rows}
      rowsMax={rowsMax}
      maxRows={maxRows}
      minRows={minRows}
      type={type}
      value={value}
      id={id}
      inputRef={inputRef}
      onBlur={onBlur}
      onChange={onChange}
      onFocus={onFocus}
      placeholder={placeholder}
      inputProps={inputProps}
      {...InputMore}
      {...InputProps}
    />
  );

  return (
    <FormControl
      className={clsx(classes?.root, className)}
      disabled={disabled}
      error={error}
      fullWidth={fullWidth}
      hiddenLabel={hiddenLabel}
      ref={ref}
      required={required}
      color={color}
      variant={variant}
      {...other}
    >
      {label && (
        <InputLabel htmlFor={id} id={inputLabelId} {...InputLabelProps}>
          {label}
        </InputLabel>
      )}

      {InputElement}

      {helperText && (
        <FormHelperText id={helperTextId} {...FormHelperTextProps}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
});

export default withStyles(styles, { name: 'MuiChipInput' })(ChipInput);
