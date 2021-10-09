import { FieldArray } from 'formik';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Grid, makeStyles } from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { PushFunc, RemoveFunc } from '../../../hooks';
import { Reference } from '../../../models/Profile';
import Typography from '../../core/Typography';
import FormikInputField from '../../composite/forms/FormikInputField';

const useStyles = makeStyles(theme => ({
  iconButtonSuccess: {
    color: theme.palette.success.main,
  },
  iconButtonNegative: {
    color: theme.palette.negative.main,
  },
}));

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
  const styles = useStyles();
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
            <Grid container item xs={1}>
              <Tooltip title={t('components.referenceSegment.tooltips.add-reference') || ''} placement={'bottom'}>
                <span>
                  <IconButton
                    aria-label="Add"
                    onClick={e => {
                      e.preventDefault();
                      handleAdd(push);
                    }}
                    className={styles.iconButtonSuccess}
                    disabled={disabled || adding}
                  >
                    <AddIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Grid>
          </Grid>
          {references?.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant={'caption'}>{t('components.referenceSegment.missing-refreneces')}</Typography>
            </Grid>
          ) : (
            references?.map((ref, index) => (
              <Grid key={index} container item xs={12} spacing={2}>
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
                <Grid item xs={1}>
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
                      className={styles.iconButtonNegative}
                      disabled={disabled || index === removing}
                    >
                      <RemoveIcon />
                    </IconButton>
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
