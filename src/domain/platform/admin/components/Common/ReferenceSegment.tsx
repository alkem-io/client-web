import { DeleteOutline } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { Box, BoxProps, Link } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { FieldArray } from 'formik';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useConfig } from '../../../config/useConfig';
import { PushFunc, RemoveFunc } from '../../../../shared/Reference/useEditReference';
import { Reference } from '../../../../common/profile/Profile';
import FormikInputField from '../../../../../common/components/composite/forms/FormikInputField';
import { TranslateWithElements } from '../../../../shared/i18n/TranslateWithElements';
import { Caption, BlockSectionTitle } from '../../../../../core/ui/typography';
import Gutters from '../../../../../core/ui/grid/Gutters';

export interface ReferenceSegmentProps extends BoxProps {
  fieldName?: string;
  references: Reference[];
  readOnly?: boolean;
  disabled?: boolean;
  compactMode?: boolean;
  onAdd?: (push: PushFunc) => void;
  // TODO REMOVE CALLBACK FROM SIGNATURE!
  onRemove?: (ref: Reference, remove: RemoveFunc) => void;
}

export const referenceSegmentValidationObject = yup.object().shape({
  name: yup.string(),
  uri: yup.string(),
});
export const referenceSegmentSchema = yup.array().of(referenceSegmentValidationObject);

export const ReferenceSegment: FC<ReferenceSegmentProps> = ({
  fieldName = 'references',
  references,
  readOnly = false,
  disabled = false,
  compactMode = false,
  onAdd,
  onRemove,
  ...props
}) => {
  const { t } = useTranslation();
  const tLinks = TranslateWithElements(<Link target="_blank" />);
  const { platform } = useConfig();
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
                aria-label="Add"
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
            <Caption>{t('components.referenceSegment.missing-refereneces')}</Caption>
          ) : (
            references?.map((attachment, index) => (
              <Gutters key={attachment.id} disablePadding>
                <Gutters row disablePadding alignItems="start">
                  <FormikInputField
                    name={`${fieldName}.${index}.name`}
                    title={t('common.title')}
                    readOnly={readOnly}
                    disabled={disabled || isRemoving(index)}
                  />
                  <FormikInputField
                    name={`${fieldName}.${index}.uri`}
                    title={t('common.url')}
                    readOnly={readOnly}
                    disabled={disabled || isRemoving(index)}
                    attachFile
                    helperText={
                      attachment.uri === ''
                        ? tLinks('components.referenceSegment.url-helper-text', {
                            terms: { href: platform?.terms },
                          })
                        : undefined
                    }
                  />
                  <Tooltip
                    title={t('components.referenceSegment.tooltips.remove-reference') || ''}
                    id={'remove a reference'}
                    placement={'bottom'}
                  >
                    <IconButton
                      aria-label="Remove"
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
