import React, { FC } from 'react';
import { Reference } from '../../../../common/profile/Profile';
import { Grid, Link, Typography } from '@mui/material';
import { FieldArray } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useConfig } from '../../../config/useConfig';
import FormikInputField from '../../../../../common/components/composite/forms/FormikInputField';
import SectionSpacer from '../../../../shared/components/Section/SectionSpacer';
import { TranslateWithElements } from '../../../../shared/i18n/TranslateWithElements';

export const RECOMMENDATIONS_COUNT = 3;

export interface RecommendationsSegmentProps {
  recommendations: Reference[];
  readOnly?: boolean;
  disabled?: boolean;
}

export const recommendationsSegmentValidationObject = yup.object().shape({
  name: yup.string(),
  uri: yup.string(),
});

export const RecommendationsSegment: FC<RecommendationsSegmentProps> = ({
  recommendations = [],
  readOnly = false,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const tLinks = TranslateWithElements(<Link target="_blank" />);
  const { platform } = useConfig();

  return (
    <FieldArray name={'recommendations'}>
      {() => (
        <Grid item container rowSpacing={2} columnSpacing={4}>
          <Grid container item xs={12} alignItems="center" wrap="nowrap">
            <Grid item>
              <Typography variant={'h4'}>{t('common.recommendations')}</Typography>
            </Grid>
          </Grid>
          {recommendations?.length === 0 ? (
            <Grid item container>
              <Typography variant={'caption'}>{t('components.referenceSegment.missing-refreneces')}</Typography>
            </Grid>
          ) : (
            recommendations?.map((reccomendation, index) => (
              <>
                <Grid key={reccomendation.id} container item>
                  <Grid item xs="auto">
                    <FormikInputField
                      name={`recommendations.${index}.name`}
                      title={t('common.title')}
                      readOnly={readOnly}
                      disabled={disabled}
                    />
                  </Grid>
                  <Grid item xs sx={{ paddingLeft: theme => theme.spacing(2) }}>
                    <FormikInputField
                      name={`recommendations.${index}.uri`}
                      title={t('common.url')}
                      readOnly={readOnly}
                      disabled={disabled}
                      helperText={
                        reccomendation.uri === ''
                          ? tLinks('components.referenceSegment.url-helper-text', {
                              terms: { href: platform?.terms },
                            })
                          : undefined
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ paddingTop: theme => theme.spacing(2) }}>
                    <FormikInputField
                      name={`recommendations.${index}.description`}
                      title={'Description'}
                      readOnly={readOnly}
                      disabled={disabled}
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
