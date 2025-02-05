import { DeleteOutline } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { Box, BoxProps, Link } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { FieldArray } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useConfig } from '@/domain/platform/config/useConfig';
import { PushFunc, RemoveFunc } from '@/domain/common/reference/useEditReference';
import { Reference } from '@/domain/common/profile/Profile';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { TranslateWithElements } from '@/domain/shared/i18n/TranslateWithElements';
import { Caption, BlockSectionTitle } from '@/core/ui/typography';
import Gutters from '@/core/ui/grid/Gutters';
import useCurrentBreakpoint from '@/core/ui/utils/useCurrentBreakpoint';
import FormikFileInput from '@/core/ui/forms/FormikFileInput/FormikFileInput';
import { MessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';
import { MID_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';

export interface ReferenceSegmentProps extends BoxProps {
  fieldName?: string;
  references: Reference[];
  readOnly?: boolean;
  disabled?: boolean;
  compactMode?: boolean;
  onAdd?: (push: PushFunc) => void;
  // TODO REMOVE CALLBACK FROM SIGNATURE!
  onRemove?: (ref: Reference, remove: RemoveFunc) => void;
  temporaryLocation?: boolean;
  fullWidth?: boolean;
}

export const referenceSegmentValidationObject = yup.object().shape({
  name: yup
    .string()
    .min(3, MessageWithPayload('forms.validations.minLength'))
    .max(SMALL_TEXT_LENGTH, MessageWithPayload('forms.validations.maxLength')),
  uri: yup.string().max(MID_TEXT_LENGTH, MessageWithPayload('forms.validations.maxLength')),
});
export const referenceSegmentSchema = yup.array().of(referenceSegmentValidationObject);

export const ReferenceSegment = ({
  fieldName = 'references',
  references,
  readOnly = false,
  disabled = false,
  compactMode = false,
  onAdd,
  onRemove,
  fullWidth,
  temporaryLocation = false,
  ...props
}: ReferenceSegmentProps) => {
  const { t } = useTranslation();
  const tLinks = TranslateWithElements(<Link target="_blank" />);
  const { locations } = useConfig();
  const breakpoint = useCurrentBreakpoint();
  const isMobile = ['xs', 'sm'].includes(breakpoint);
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

  return (
    <FieldArray name={fieldName}>
      {({ push, remove }) => (
        <Gutters disablePadding {...props}>
          <Box display="flex" alignItems="center">
            <BlockSectionTitle>{t('components.referenceSegment.title')}</BlockSectionTitle>
            <Tooltip title={t('components.referenceSegment.tooltips.add-reference')} placement={'bottom'}>
              <IconButton
                aria-label={t('callout.link-collection.add-another')}
                onClick={() => {
                  handleAdd(push);
                }}
                color="primary"
                disabled={disabled || adding}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>
          {!compactMode && references?.length === 0 ? (
            <Caption>{t('components.referenceSegment.missing-references')}</Caption>
          ) : (
            references?.map((attachment, index) => (
              <Gutters key={attachment.id ?? index} disablePadding>
                <Gutters row={!isMobile} disablePadding alignItems="start">
                  <FormikInputField
                    name={`${fieldName}.${index}.name`}
                    title={t('common.title')}
                    readOnly={readOnly}
                    disabled={disabled || isRemoving(index)}
                    fullWidth={isMobile}
                  />
                  <Box display="flex" flexDirection="row" sx={fullWidth ? { width: '100%' } : {}}>
                    <FormikFileInput
                      fullWidth={fullWidth}
                      name={`${fieldName}.${index}.uri`}
                      title={t('common.url')}
                      readOnly={readOnly}
                      disabled={disabled || isRemoving(index)}
                      entityID={attachment.id}
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
                  <Box>
                    <FormikInputField
                      name={`${fieldName}.${index}.description`}
                      title={'Description'}
                      readOnly={readOnly}
                      disabled={disabled || isRemoving(index)}
                    />
                  </Box>
                )}
              </Gutters>
            ))
          )}
        </Gutters>
      )}
    </FieldArray>
  );
};

export default ReferenceSegment;
