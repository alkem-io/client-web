import TranslationKey from '@/core/i18n/utils/TranslationKey';
import { error as logError } from '@/core/logging/sentry/log';
import { gutters } from '@/core/ui/grid/utils';
import { useValidationMessageTranslation } from '@/domain/shared/i18n/ValidationMessageTranslation';
import { FormControl, FormHelperText, InputLabel, InputProps, OutlinedInput, useFormControl } from '@mui/material';
import { useField } from 'formik';
import { ChangeEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CharacterCounter from '../characterCounter/CharacterCounter';
import { MarkdownTextMaxLength } from '../field-length.constants';
import { CharacterCountContainer, CharacterCountContextProvider } from './CharacterCountContext';
import MarkdownInput, { MarkdownInputRefApi } from './MarkdownInput';
import { isMarkdownMaxLengthError } from './MarkdownValidator';

interface MarkdownFieldProps extends InputProps {
  title: string;
  name: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: MarkdownTextMaxLength;
  counterDisabled?: boolean;
  helperText?: string;
  loading?: boolean; // TODO make use of
  hideImageOptions?: boolean;
  temporaryLocation?: boolean;
  controlsVisible?: 'always' | 'focused';
}

const FilledDetector = ({ value }: { value: string | undefined }) => {
  const formControl = useFormControl();

  useLayoutEffect(() => {
    if (!formControl) {
      throw new Error('Must be wrapped in FormControl');
    }
    const { onFilled, onEmpty } = formControl;
    if (value) {
      onFilled();
    } else {
      onEmpty();
    }
  }, [value, formControl]);

  return null;
};

/**
 * Requires StorageConfigContextProvider
 */
export const FormikMarkdownField = ({
  title,
  name,
  required = false,
  readOnly = false,
  disabled = false,
  placeholder,
  maxLength,
  counterDisabled = false,
  helperText: validInputHelperText,
  hideImageOptions,
  temporaryLocation = false,
  controlsVisible = 'always',
}: MarkdownFieldProps) => {
  const tErr = useValidationMessageTranslation();
  const { t } = useTranslation();

  // Usually store a reference to the child in a Ref, but in this case we need state
  // cause label's presence/position depends on the presence of this ref.
  const [inputElement, setInputElement] = useState<MarkdownInputRefApi | null>(null);

  const inputElementRef = useRef<MarkdownInputRefApi | null>(null);

  const validate = () => {
    const characterCount = inputElementRef.current?.value?.length ?? 0;
    const isAboveCharacterLimit = maxLength && characterCount > maxLength;
    if (isAboveCharacterLimit) {
      return isAboveCharacterLimit ? t('forms.validations.maxLength', { max: maxLength }) : undefined;
    }
  };

  const [field, meta, helper] = useField({ name, validate });

  const isError = Boolean(meta.error) && meta.touched;

  useEffect(() => {
    if (meta.error && isMarkdownMaxLengthError(meta.error)) {
      const { path, max } = meta.error;
      logError(new TypeError(`${path} exceeded the length limit of ${max} chars.`));
    }
  }, [meta.error]);

  const helperText = useMemo(() => {
    if (!isError) {
      return validInputHelperText;
    }
    return tErr(meta.error as TranslationKey, { field: title });
  }, [isError, meta.error, validInputHelperText, tErr, title]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const trimmedValue = event.target.value.trim();
      const newValue = trimmedValue === '<br>' ? '' : event.target.value;
      helper.setValue(newValue);
    },
    [helper]
  );

  const handleBlur = useCallback(() => {
    helper.setTouched(true);
  }, [helper]);

  const inputRef = useCallback(
    (nextInputElement: MarkdownInputRefApi | null) => {
      inputElementRef.current = nextInputElement;
      setInputElement(nextInputElement);
    },
    [inputElementRef]
  );

  const focusInput = () => {
    inputElement?.focus();
  };

  const labelOffset = inputElement?.getLabelOffset();

  return (
    <FormControl required={required} disabled={disabled} error={isError} fullWidth>
      <CharacterCountContextProvider>
        <FilledDetector value={inputElement?.value} />
        {labelOffset && (
          <InputLabel
            onClick={focusInput}
            sx={{
              ':not(.MuiInputLabel-shrink)': {
                transform: `translate(${labelOffset.x}, ${labelOffset.y}) scale(1)`,
              },
            }}
          >
            {title}
          </InputLabel>
        )}
        <OutlinedInput
          value={field.value}
          onChange={handleChange}
          onBlur={handleBlur}
          label={title}
          inputComponent={MarkdownInput}
          inputRef={inputRef}
          inputProps={{
            controlsVisible,
            maxLength,
            hideImageOptions,
            temporaryLocation,
          }}
          readOnly={readOnly}
          placeholder={placeholder}
          multiline
          sx={{
            '&.MuiOutlinedInput-root': {
              padding: gutters(0.5),
            },
          }}
        />
        <CharacterCountContainer>
          {({ characterCount }) => (
            <CharacterCounter count={characterCount} maxLength={maxLength} disabled={counterDisabled || !maxLength}>
              <FormHelperText error={isError}>
                <>{helperText}</>
              </FormHelperText>
            </CharacterCounter>
          )}
        </CharacterCountContainer>
      </CharacterCountContextProvider>
    </FormControl>
  );
};

export default FormikMarkdownField;
