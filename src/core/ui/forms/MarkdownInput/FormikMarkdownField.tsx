import {
  ChangeEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  ClipboardEvent,
  PropsWithChildren,
} from 'react';
import {
  FormControl,
  FormHelperText,
  InputBaseComponentProps,
  InputLabel,
  InputProps,
  OutlinedInput,
  useFormControl,
} from '@mui/material';
import { useField } from 'formik';
import { Editor } from '@tiptap/react';
import CharacterCounter from '../characterCounter/CharacterCounter';
import TranslationKey from '@/core/i18n/utils/TranslationKey';
import { useValidationMessageTranslation } from '@/domain/shared/i18n/ValidationMessageTranslation';
import MarkdownInput, { MarkdownInputRefApi } from './MarkdownInput';
import { CharacterCountContainer, CharacterCountContextProvider } from './CharacterCountContext';
import { gutters } from '@/core/ui/grid/utils';
import { MarkdownTextMaxLength } from '../field-length.constants';
import { error as logError } from '@/core/logging/sentry/log';
import { isMarkdownMaxLengthError } from './MarkdownValidator';
import { useTranslation } from 'react-i18next';
import { useUploadFileMutation } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '../../notifications/useNotification';
import { useStorageConfigContext } from '@/domain/storage/StorageBucket/StorageConfigContext';

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
  const [editor, setEditor] = useState<Editor>();

  const notify = useNotification();

  const validate = () => {
    const characterCount = inputElementRef.current?.value?.length ?? 0;
    const isAboveCharacterLimit = maxLength && characterCount > maxLength;
    if (isAboveCharacterLimit) {
      return isAboveCharacterLimit ? t('forms.validations.maxLength', { max: maxLength }) : undefined;
    }
  };

  const storageConfig = useStorageConfigContext();

  const [field, meta, helper] = useField({ name, validate });

  const [uploadFile] = useUploadFileMutation({
    onCompleted: data => {
      notify(t('components.file-upload.file-upload-success'), 'success');

      editor?.commands.setImage({ src: data.uploadFileOnStorageBucket, alt: 'pasted-image' });
    },
    onError: error => {
      logError(error);
    },
  });

  const { t } = useTranslation();

  const tErr = useValidationMessageTranslation();

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

  const handleOnChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const trimmedValue = event.target.value.trim();
      const newValue = trimmedValue === '<br>' ? '' : event.target.value;
      helper.setValue(newValue);
    },
    [helper]
  );

  const handleOnPaste = useCallback(
    (event: ClipboardEvent) => {
      const clipboardData = event.clipboardData;
      const items = clipboardData.items;

      if (!items) return;

      const storageBucketId = storageConfig?.storageBucketId;

      if (storageBucketId) {
        let hasImage = false;

        for (const item of items) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              const reader = new FileReader();

              reader.onload = () => {
                uploadFile({
                  variables: {
                    file,
                    uploadData: {
                      storageBucketId,
                      temporaryLocation,
                    },
                  },
                });
              };

              reader.readAsDataURL(file); // Read to trigger onLoad.
              hasImage = true;
            }
          }
        }

        if (hasImage) {
          event.preventDefault(); // Prevent default only if there's an image.
        }
      }
    },
    [storageConfig?.storageBucketId, uploadFile]
  );

  const handleBlur = useCallback(() => {
    helper.setTouched(true);
  }, [helper]);

  // Usually store a reference to the child in a Ref, but in this case we need state
  // cause label's presence/position depends on the presence of this ref.
  const [inputElement, setInputElement] = useState<MarkdownInputRefApi | null>(null);
  const inputElementRef = useRef<MarkdownInputRefApi | null>(null);

  const inputRef = useCallback((nextInputElement: MarkdownInputRefApi | null) => {
    inputElementRef.current = nextInputElement;
    setInputElement(nextInputElement);
  }, []);

  const focusInput = () => {
    inputElement?.focus();
  };

  const handleImagePaste = useCallback((edtr: Editor) => setEditor(edtr), []);

  const inputComponent = useCallback(
    (props: PropsWithChildren<InputBaseComponentProps>) => (
      <MarkdownInput {...props} pasteImageHandler={handleImagePaste} />
    ),
    [handleImagePaste]
  );

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
          multiline
          label={title}
          value={field.value}
          inputRef={inputRef}
          readOnly={readOnly}
          inputProps={{
            maxLength,
            controlsVisible,
            hideImageOptions,
            temporaryLocation,
          }}
          placeholder={placeholder}
          inputComponent={inputComponent}
          sx={{ '&.MuiOutlinedInput-root': { padding: gutters(0.5) } }}
          onBlur={handleBlur}
          onPaste={handleOnPaste}
          onChange={handleOnChange}
        />

        <CharacterCountContainer>
          {({ characterCount }) => (
            <CharacterCounter count={characterCount} maxLength={maxLength} disabled={counterDisabled || !maxLength}>
              <FormHelperText error={isError}>{helperText}</FormHelperText>
            </CharacterCounter>
          )}
        </CharacterCountContainer>
      </CharacterCountContextProvider>
    </FormControl>
  );
};

export default FormikMarkdownField;
