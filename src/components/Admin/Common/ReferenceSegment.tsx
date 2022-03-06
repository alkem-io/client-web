import { DeleteOutline } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { Grid, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { FieldArray } from 'formik';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { PushFunc, RemoveFunc } from '../../../hooks';
import { Reference } from '../../../models/Profile';
import FormikInputField from '../../composite/forms/FormikInputField';

export interface ReferenceSegmentProps {
  references: Reference[];
  readOnly?: boolean;
  disabled?: boolean;
  onAdd?: (push: PushFunc) => void;
  onRemove?: (ref: Reference, remove: RemoveFunc) => void;
}

export const referenceSegmentValidationObject = yup.object().shape({
  name: yup.string(),
  uri: yup.string(),
});
export const referenceSegmentSchema = yup.array().of(referenceSegmentValidationObject);

export const ReferenceSegment: FC<ReferenceSegmentProps> = ({
  references,
  readOnly = false,
  disabled = false,
  onAdd,
  onRemove,
}) => {
  const { t } = useTranslation();
  const [removing, setRemoving] = useState<number | undefined>();
  const [adding, setAdding] = useState(false);

  const handleAdd = (push: (obj: any) => void) => {
    if (onAdd) {
      setAdding(true);
      return onAdd((obj?: any) => {
        if (obj) push(obj);
        setAdding(false);
      });
    }
    push({ name: '', uri: '' });
  };

  return (
    <FieldArray name={'references'}>
      {({ push, remove }) => (
        <Grid item container rowSpacing={2} columnSpacing={4}>
          <Grid container item xs={12} alignItems="center" wrap="nowrap">
            <Grid item>
              <Typography variant={'h4'}>{t('components.referenceSegment.title')}</Typography>
            </Grid>
            <Grid item>
              <Tooltip title={t('components.referenceSegment.tooltips.add-reference') || ''} placement={'bottom'}>
                <IconButton
                  aria-label="Add"
                  onClick={e => {
                    e.preventDefault();
                    handleAdd(push);
                  }}
                  color="primary"
                  disabled={disabled || adding}
                  size="large"
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
          {references?.length === 0 ? (
            <Grid item container>
              <Typography variant={'caption'}>{t('components.referenceSegment.missing-refreneces')}</Typography>
            </Grid>
          ) : (
            references?.map((ref, index) => (
              <Grid key={index} container item spacing={4}>
                <Grid item xs="auto">
                  <FormikInputField
                    name={`references.${index}.name`}
                    title={'Name'}
                    readOnly={readOnly}
                    disabled={disabled || index === removing}
                  />
                </Grid>
                <Grid item flexGrow={1}>
                  <FormikInputField
                    name={`references.${index}.uri`}
                    title={'URI'}
                    readOnly={readOnly}
                    disabled={disabled || index === removing}
                  />
                </Grid>
                <Grid item xs="auto">
                  <Tooltip
                    title={t('components.referenceSegment.tooltips.remove-reference') || ''}
                    id={'remove a reference'}
                    placement={'bottom'}
                  >
                    <IconButton
                      aria-label="Remove"
                      onClick={e => {
                        e.preventDefault();
                        if (onRemove) {
                          setRemoving(index);
                          onRemove(ref, (success: boolean) => {
                            if (success) remove(index);
                            setRemoving(undefined);
                          });
                        } else {
                          remove(index);
                        }
                      }}
                      disabled={disabled || index === removing}
                      size="large"
                    >
                      <DeleteOutline />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item xs={12}>
                  <FormikInputField
                    name={`references.${index}.description`}
                    title={'Description'}
                    readOnly={readOnly}
                    disabled={disabled || index === removing}
                  />
                </Grid>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </FieldArray>
  );
};
export default ReferenceSegment;
