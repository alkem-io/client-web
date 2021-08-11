import { Grid, Input } from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';
import { FieldArray } from 'formik';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { PushFunc, RemoveFunc } from '../../../hooks';
import { Reference } from '../../../models/Profile';
import Button from '../../core/Button';
import Typography from '../../core/Typography';
import FormikInputField from './FormikInputField';

export interface ReferenceSegmentProps {
  references: Reference[];
  readOnly?: boolean;
  disabled?: boolean;
  onAdd?: (push: PushFunc) => void;
  onRemove?: (ref: Reference, remove: RemoveFunc) => void;
}

export const referenceSegmentSchema = yup.array().of(
  yup.object().shape({
    name: yup.string(),
    uri: yup.string(),
  })
);

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
        <>
          <Grid container item xs={12} spacing={2}>
            <Grid item xs={11}>
              <Typography variant={'h4'} color={'primary'}>
                {t('components.referenceSegment.title')}
              </Typography>
            </Grid>
            <Grid container item xs={1} justifyContent={'flex-end'}>
              <Tooltip title={t('components.referenceSegment.tooltips.add-reference') || ''} placement={'bottom'}>
                <span>
                  <Button
                    type={'button'}
                    onClick={e => {
                      e.preventDefault();
                      handleAdd(push);
                    }}
                    disabled={disabled || adding}
                    text="+"
                  />
                </span>
              </Tooltip>
            </Grid>
          </Grid>
          {references?.length === 0 ? (
            <Grid item xs={12}>
              <Input
                type={'text'}
                placeholder={t('components.referenceSegment.missing-refreneces')}
                readOnly={true}
                disabled={true}
                fullWidth
              />
            </Grid>
          ) : (
            references?.map((ref, index) => (
              <Grid key={index} container item alignItems={'flex-end'} xs={12} spacing={2}>
                <Grid item xs={4}>
                  <FormikInputField
                    name={`references.${index}.name`}
                    title={'Name'}
                    readOnly={readOnly}
                    disabled={disabled || index === removing}
                  />
                </Grid>
                <Grid item xs={7}>
                  <FormikInputField
                    name={`references.${index}.uri`}
                    title={'URI'}
                    readOnly={readOnly}
                    disabled={disabled || index === removing}
                  />
                </Grid>
                <Grid container item xs={1} justifyContent={'flex-end'} spacing={0}>
                  <Tooltip
                    title={t('components.referenceSegment.tooltips.remove-reference') || ''}
                    id={'remove a reference'}
                    placement={'bottom'}
                  >
                    <Button
                      type={'button'}
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
                      variant={'negative'}
                      disabled={disabled || index === removing}
                      text="-"
                    />
                  </Tooltip>
                </Grid>
              </Grid>
            ))
          )}
        </>
      )}
    </FieldArray>
  );
};
export default ReferenceSegment;
