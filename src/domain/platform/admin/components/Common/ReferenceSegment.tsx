import { DeleteOutline } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { Box, Grid, Link, Typography } from '@mui/material';
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
import SectionSpacer from '../../../../shared/components/Section/SectionSpacer';
import { TranslateWithElements } from '../../../../shared/i18n/TranslateWithElements';

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
  const tLinks = TranslateWithElements(<Link target="_blank" />);
  const { platform } = useConfig();
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
              <>
                <Grid key={index} container item>
                  <Grid item xs="auto">
                    <FormikInputField
                      name={`references.${index}.name`}
                      title={t('common.title')}
                      readOnly={readOnly}
                      disabled={disabled || index === removing}
                    />
                  </Grid>
                  <Grid item xs sx={{ paddingLeft: theme => theme.spacing(2) }}>
                    <FormikInputField
                      name={`references.${index}.uri`}
                      title={t('common.url')}
                      readOnly={readOnly}
                      disabled={disabled || index === removing}
                      attachFile
                      helperText={
                        ref.uri === ''
                          ? tLinks('components.referenceSegment.url-helper-text', {
                              terms: { href: platform?.terms },
                            })
                          : undefined
                      }
                    />
                  </Grid>
                  <Grid item>
                    <Box display={'flex'} alignItems={'baseline'} height="100%">
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
                    </Box>
                  </Grid>
                  <Grid item xs={12} sx={{ paddingTop: theme => theme.spacing(2) }}>
                    <FormikInputField
                      name={`references.${index}.description`}
                      title={'Description'}
                      readOnly={readOnly}
                      disabled={disabled || index === removing}
                    />
                  </Grid>
                </Grid>
                {references.length > index + 1 && <SectionSpacer double />}
              </>
            ))
          )}
        </Grid>
      )}
    </FieldArray>
  );
};
export default ReferenceSegment;
