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
import CollaborativeMarkdownInput, { CollaborativeMarkdownInputRefApi } from './CollaborativeMarkdownInput';
import { isMarkdownMaxLengthError } from './MarkdownValidator';

interface CollaborativeMarkdownFieldProps extends InputProps {
  title: string;
  name: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: MarkdownTextMaxLength;
  counterDisabled?: boolean;
  helperText?: string;
  loading?: boolean;
  hideImageOptions?: boolean;
  temporaryLocation?: boolean;
  controlsVisible?: 'always' | 'focused';
  // Collaboration props
  documentId: string;
  serverUrl: string;
  userInfo: {
    name: string;
    color: string;
    userId: string;
  };
  token?: string;
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
export const FormikCollaborativeMarkdownField = ({
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
  documentId,
  serverUrl,
  userInfo,
  token,
}: CollaborativeMarkdownFieldProps) => {
  const tErr = useValidationMessageTranslation();
  const { t } = useTranslation();

  const [inputElement, setInputElement] = useState<CollaborativeMarkdownInputRefApi | null>(null);
  const inputElementRef = useRef<CollaborativeMarkdownInputRefApi | null>(null);

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
    (nextInputElement: CollaborativeMarkdownInputRefApi | null) => {
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
          inputComponent={CollaborativeMarkdownInput}
          inputRef={inputRef}
          inputProps={{
            controlsVisible,
            maxLength,
            hideImageOptions,
            temporaryLocation,
            documentId,
            serverUrl,
            userInfo,
            token,
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

export default FormikCollaborativeMarkdownField;
