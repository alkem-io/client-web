import { DeleteOutline } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { Box, BoxProps, Divider, Link } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { FieldArray, useFormikContext } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useConfig } from '@/domain/platform/config/useConfig';
import { PushFunc, RemoveFunc } from '@/domain/common/reference/useEditReference';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { TranslateWithElements } from '@/domain/shared/i18n/TranslateWithElements';
import { Caption, BlockSectionTitle } from '@/core/ui/typography';
import Gutters from '@/core/ui/grid/Gutters';
import { useScreenSize } from '@/core/ui/grid/constants';
import FormikFileInput from '@/core/ui/forms/FormikFileInput/FormikFileInput';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';
import { MARKDOWN_TEXT_LENGTH, MID_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';

export interface ReferenceSegmentProps extends BoxProps {
  fieldName?: string;
  references: ReferenceModel[];
  readOnly?: boolean;
  disabled?: boolean;
  compactMode?: boolean;
  addButtonPosition?: 'start' | 'end';
  addButtonLabel?: string;
  onAdd?: (push: PushFunc) => void;
  // TODO REMOVE CALLBACK FROM SIGNATURE!
  onRemove?: (ref: ReferenceModel, remove: RemoveFunc) => void;
  temporaryLocation?: boolean;
  fullWidth?: boolean;
}

export const referenceSegmentValidationObject = yup.object().shape({
  name: textLengthValidator({
    minLength: 3,
    maxLength: SMALL_TEXT_LENGTH,
    required: true,
  }),
  uri: yup
    .string()
    .max(MID_TEXT_LENGTH, ({ max }) => TranslatedValidatedMessageWithPayload('forms.validations.maxLength')({ max }))
    .test(
      // The yup .url() validation doesn't allow localhost urls
      'is-valid-url',
      TranslatedValidatedMessageWithPayload('forms.validations.invalidUrl'),
      value => {
        if (!value) return true; // Allow empty values if not required
        try {
          const url = new window.URL(value);
          return !!url;
        } catch {
          return false;
        }
      }
    ),
  description: MarkdownValidator(MARKDOWN_TEXT_LENGTH), // It's not markdown in the client but it's a TEXT column in the DB
});
export const referenceSegmentSchema = yup.array().of(referenceSegmentValidationObject);

export const ReferenceSegment = ({
  fieldName = 'references',
  references,
  readOnly = false,
  disabled = false,
  compactMode = false,
  addButtonPosition = 'start',
  addButtonLabel,
  onAdd,
  onRemove,
  fullWidth,
  temporaryLocation = false,
  ...props
}: ReferenceSegmentProps) => {
  const { t } = useTranslation();
  const { setFieldValue, touched } = useFormikContext();
  const tLinks = TranslateWithElements(<Link target="_blank" />);
  const { locations } = useConfig();
  const { isSmallScreen } = useScreenSize();
  const [removingItems, setRemovingItems] = useState<Partial<Record<number, boolean>>>({});
  const [adding, setAdding] = useState(false);

  const isRemoving = (index: number) => Boolean(removingItems[index]);
  const setRemoving = (index: number, state: boolean) =>
    setRemovingItems(items => ({
      ...items,
      [index]: state,
    }));

  const handleAdd = (push: (obj: unknown) => void) => {
    if (onAdd) {
      setAdding(true);
      return onAdd((obj?: unknown) => {
        if (obj) push(obj);
        setAdding(false);
      });
    }
    push({ name: '', uri: '' });
  };

  const onFileUploaded = (referenceIndex: number, fileName: string) => {
    if (!touched?.[fieldName]?.[referenceIndex]?.name) {
      setFieldValue(`${fieldName}.${referenceIndex}.name`, fileName);
    }
  };

  return (
    <FieldArray name={fieldName}>
      {({ push, remove }) => (
        <Gutters disablePadding {...props}>
          {addButtonPosition === 'start' && (
            <Box display="flex" alignItems="center">
              <IconButton
                aria-label={t('components.referenceSegment.addReference')}
                onClick={() => {
                  handleAdd(push);
                }}
                color="primary"
                disabled={disabled || adding}
              >
                <AddIcon />
              </IconButton>
              <BlockSectionTitle>{addButtonLabel ?? t('components.referenceSegment.addReference')}</BlockSectionTitle>
            </Box>
          )}
          {!compactMode && references?.length === 0 ? (
            <Caption>{t('components.referenceSegment.missing-references')}</Caption>
          ) : (
            references?.map((attachment, index) => (
              <Gutters key={attachment.id ?? attachment.ID ?? index} disablePadding>
                <Gutters row={!isSmallScreen} disablePadding alignItems="start">
                  <FormikInputField
                    name={`${fieldName}.${index}.name`}
                    title={t('common.title')}
                    readOnly={readOnly}
                    disabled={disabled || isRemoving(index)}
                    fullWidth={isSmallScreen}
                    sx={{ flexGrow: 1 }}
                  />
                  <Box display="flex" flexDirection="row" flexGrow={1} sx={fullWidth ? { width: '100%' } : {}}>
                    <FormikFileInput
                      fullWidth={fullWidth}
                      name={`${fieldName}.${index}.uri`}
                      title={t('common.url')}
                      readOnly={readOnly}
                      disabled={disabled || isRemoving(index)}
                      entityID={attachment.id}
                      onChange={fileName => onFileUploaded(index, fileName)}
                      helperText={tLinks('components.referenceSegment.url-helper-text', {
                        terms: {
                          href: locations?.terms,
                          'aria-label': t('components.referenceSegment.plaintext-helper-text'),
                        },
                      })}
                      temporaryLocation={temporaryLocation}
                    />
                    <Box>
                      <Tooltip
                        title={t('components.referenceSegment.tooltips.remove-reference') || ''}
                        id={'remove a reference'}
                        placement={'bottom'}
                      >
                        <IconButton
                          aria-label={t('common.remove')}
                          onClick={() => {
                            // TODO When onRemove doesn't have this callback signature anymore
                            // TODO remove branching and use `try { ... } finally { setRemoving(index, false) }`
                            if (onRemove) {
                              setRemoving(index, true);
                              onRemove(attachment, (success: boolean) => {
                                if (success) remove(index);
                                setRemoving(index, false);
                              });
                            } else {
                              remove(index);
                            }
                          }}
                          disabled={disabled || isRemoving(index)}
                          size="large"
                        >
                          <DeleteOutline />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Gutters>
                {!compactMode && (
                  <Gutters disablePadding>
                    <FormikInputField
                      name={`${fieldName}.${index}.description`}
                      title={'Description'}
                      readOnly={readOnly}
                      disabled={disabled || isRemoving(index)}
                    />
                  </Gutters>
                )}
                {index < references.length - 1 && !compactMode && <Divider />}
              </Gutters>
            ))
          )}
          {addButtonPosition === 'end' && (
            <Box display="flex" alignItems="center" justifyContent="end">
              <BlockSectionTitle>{addButtonLabel ?? t('components.referenceSegment.addReference')}</BlockSectionTitle>
              <IconButton
                aria-label={t('components.referenceSegment.addReference')}
                onClick={() => {
                  handleAdd(push);
                }}
                color="primary"
                disabled={disabled || adding}
              >
                <AddIcon />
              </IconButton>
            </Box>
          )}
        </Gutters>
      )}
    </FieldArray>
  );
};

export default ReferenceSegment;
