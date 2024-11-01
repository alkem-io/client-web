import { useState } from 'react';

import * as yup from 'yup';
import { FieldArray } from 'formik';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import { DeleteOutline } from '@mui/icons-material';
import { Box, BoxProps, Link } from '@mui/material';

import Gutters from '../../../../../core/ui/grid/Gutters';
import { Caption, BlockSectionTitle } from '../../../../../core/ui/typography';
import { TranslateWithElements } from '../../../../shared/i18n/TranslateWithElements';
import { MessageWithPayload } from '../../../../shared/i18n/ValidationMessageTranslation';
import FormikFileInput from '../../../../../core/ui/forms/FormikFileInput/FormikFileInput';
import FormikInputField from '../../../../../core/ui/forms/FormikInputField/FormikInputField';

import { useConfig } from '../../../config/useConfig';
import { Reference } from '../../../../common/profile/Profile';
import { PushFunc, RemoveFunc } from '../../../../common/reference/useEditReference';
import useCurrentBreakpoint from '../../../../../core/ui/utils/useCurrentBreakpoint';
import { MID_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '../../../../../core/ui/forms/field-length.constants';

export const referenceSegmentValidationObject = yup.object().shape({
  name: yup
    .string()
    .min(3, MessageWithPayload('forms.validations.minLength'))
    .max(SMALL_TEXT_LENGTH, MessageWithPayload('forms.validations.maxLength')),
  uri: yup.string().max(MID_TEXT_LENGTH, MessageWithPayload('forms.validations.maxLength')),
});
export const referenceSegmentSchema = yup.array().of(referenceSegmentValidationObject);

export const ReferenceSegment = ({
  references,
  readOnly = false,
  disabled = false,
  compactMode = false,
  fieldName = 'references',
  temporaryLocation = false,
  onAdd,
  onRemove,
  ...rest
}: ReferenceSegmentProps) => {
  const [adding, setAdding] = useState(false);
  const [removingItems, setRemovingItems] = useState<Partial<Record<number, boolean>>>({});

  const { t } = useTranslation();

  const { locations } = useConfig();

  const breakpoint = useCurrentBreakpoint();

  const isMobile = ['xs', 'sm'].includes(breakpoint);

  const tLinks = TranslateWithElements(<Link target="_blank" />);

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
        <Gutters disablePadding {...rest}>
          <Box display="flex" alignItems="center">
            <BlockSectionTitle>{t('components.referenceSegment.title')}</BlockSectionTitle>

            <Tooltip title={t('components.referenceSegment.tooltips.add-reference')} placement={'bottom'}>
              <IconButton
                color="primary"
                disabled={disabled || adding}
                onClick={() => handleAdd(push)}
                aria-label={t('callout.link-collection.add-another')}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {!compactMode && references?.length === 0 ? (
            <Caption>{t('components.referenceSegment.missing-refereneces')}</Caption>
          ) : (
            references?.map((attachment, index) => {
              const isDisabled = disabled || isRemoving(index);

              return (
                <Gutters key={attachment.id ?? index} disablePadding>
                  <Gutters disablePadding row={!isMobile} alignItems="start">
                    <FormikInputField
                      readOnly={readOnly}
                      fullWidth={isMobile}
                      disabled={isDisabled}
                      title={t('common.title')}
                      name={`${fieldName}.${index}.name`}
                    />

                    <Box display="flex" flexDirection="row">
                      <FormikFileInput
                        readOnly={readOnly}
                        disabled={isDisabled}
                        title={t('common.url')}
                        entityID={attachment.id}
                        name={`${fieldName}.${index}.uri`}
                        temporaryLocation={temporaryLocation}
                        helperText={tLinks('components.referenceSegment.url-helper-text', {
                          terms: {
                            href: locations?.terms,
                            'aria-label': t('components.referenceSegment.plaintext-helper-text'),
                          },
                        })}
                      />

                      <Box>
                        <Tooltip
                          placement="bottom"
                          id="remove a reference"
                          title={t('components.referenceSegment.tooltips.remove-reference') || ''}
                        >
                          <IconButton
                            size="large"
                            disabled={isDisabled}
                            onClick={() => {
                              // TODO When onRemove doesn't have this callback signature anymore
                              // TODO remove branching and use `try { ... } finally { setRemoving(index, false) }`

                              if (onRemove) {
                                setRemoving(index, true);
                                onRemove(attachment, (success: boolean) => {
                                  if (success) {
                                    remove(index);
                                  }

                                  setRemoving(index, false);
                                });
                              } else {
                                remove(index);
                              }
                            }}
                            aria-label={t('common.remove')}
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
                        readOnly={readOnly}
                        disabled={isDisabled}
                        title={t('common.description')}
                        name={`${fieldName}.${index}.description`}
                      />
                    </Box>
                  )}
                </Gutters>
              );
            })
          )}
        </Gutters>
      )}
    </FieldArray>
  );
};

export default ReferenceSegment;

export interface ReferenceSegmentProps extends BoxProps {
  references: Reference[];

  fieldName?: string;
  readOnly?: boolean;
  disabled?: boolean;
  compactMode?: boolean;
  temporaryLocation?: boolean;
  onAdd?: (push: PushFunc) => void;
  // TODO REMOVE CALLBACK FROM SIGNATURE!
  onRemove?: (ref: Reference, remove: RemoveFunc) => void;
}
