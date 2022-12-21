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

export const RECOMMENDATIONS_COUNT = 3;

export interface RecommendationsSegmentProps {
  recommendations: Reference[];
  readOnly?: boolean;
  disabled?: boolean;
  onAdd?: (push: PushFunc) => void;
  onRemove?: (ref: Reference, remove: RemoveFunc) => void;
}

export const recommendationsSegmentValidationObject = yup.object().shape({
  name: yup.string(),
  uri: yup.string(),
});
export const recommendationsSegmentSchema = yup
  .array()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .test({ message: '', test: (arr: any) => arr.length === RECOMMENDATIONS_COUNT })
  .of(recommendationsSegmentValidationObject);

export const RecommendationsSegment: FC<RecommendationsSegmentProps> = ({
  recommendations = [],
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

  while (recommendations.length < RECOMMENDATIONS_COUNT) {
    recommendations.push({
      name: '',
      uri: '',
    });
  }

  return (
    <FieldArray name={'recommendations'}>
      {({ push, remove }) => (
        <Grid item container rowSpacing={2} columnSpacing={4}>
          <Grid container item xs={12} alignItems="center" wrap="nowrap">
            <Grid item>
              <Typography variant={'h4'}>{t('common.recommendations')}</Typography>
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
          {recommendations?.length === 0 ? (
            <Grid item container>
              <Typography variant={'caption'}>{t('components.referenceSegment.missing-refreneces')}</Typography>
            </Grid>
          ) : (
            recommendations?.map((ref, index) => (
              <>
                <Grid key={index} container item>
                  <Grid item xs="auto">
                    <FormikInputField
                      name={`recommendations.${index}.name`}
                      title={t('common.title')}
                      readOnly={readOnly}
                      disabled={disabled || index === removing}
                    />
                  </Grid>
                  <Grid item xs sx={{ paddingLeft: theme => theme.spacing(2) }}>
                    <FormikInputField
                      name={`recommendations.${index}.uri`}
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
                        id={'remove a recommendation'}
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
                      name={`recommendations.${index}.description`}
                      title={'Description'}
                      readOnly={readOnly}
                      disabled={disabled || index === removing}
                    />
                  </Grid>
                </Grid>
                {recommendations.length > index + 1 && <SectionSpacer double />}
              </>
            ))
          )}
        </Grid>
      )}
    </FieldArray>
  );
};

export default RecommendationsSegment;
