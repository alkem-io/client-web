import { Grid } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { makeStyles } from '@mui/styles';
import { Formik } from 'formik';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useApolloErrorHandler, useHub } from '../../../../hooks';
import {
  refetchOpportunityAspectsOldQuery,
  useOpportunityTemplateQuery,
  useUpdateAspectMutation,
} from '../../../../hooks/generated/graphql';
import { replaceAll } from '../../../../utils/replaceAll';
import Button from '../../../core/Button';
import { DialogActions, DialogContent, DialogTitle } from '../../../core/dialog';
import { TextArea } from '../../../core/TextInput';
import { FormikSelect } from '../../forms/FormikSelect';

interface Props {
  show: boolean;
  onHide: () => void;
  data?: any;
  id?: string;
  opportunityId: string;
  contextId: string;
  actorGroupId?: string;
  isCreate?: boolean;
  existingAspectNames?: string[];
}

const useContextEditStyles = makeStyles(theme => ({
  field: {
    marginBottom: theme.spacing(2),
  },
  row: {
    display: 'flex',
    gap: 20,
    alignItems: 'center',
    '& > div': {
      flexGrow: 1,
    },
  },
  body: {
    maxHeight: 600,
    overflow: 'auto',
  },
}));

const AspectEdit: FC<Props> = ({ show, onHide, data, id, opportunityId, contextId, existingAspectNames }) => {
  const { t } = useTranslation();
  const { hubNameId } = useHub();
  const styles = useContextEditStyles();
  const handleError = useApolloErrorHandler();
  const { data: config } = useOpportunityTemplateQuery();

  const aspectsTypes = config?.configuration.template.opportunities[0].aspects;
  const isCreate = !id;

  const availableTypes =
    isCreate && existingAspectNames
      ? aspectsTypes?.filter(at => !existingAspectNames.includes(replaceAll('_', ' ', at)))
      : aspectsTypes;

  const initialValues = {
    id: id || '',
    title: (isCreate ? availableTypes && availableTypes[0] : data?.title) || '',
  };
  const validationSchema = yup.object().shape({
    title: yup.string().required(),
    framing: yup.string().required(),
    explanation: yup.string().required(),
  });

  const [updateAspect] = useUpdateAspectMutation({
    onCompleted: () => onHide(),
    onError: handleError,
    refetchQueries: [refetchOpportunityAspectsOldQuery({ hubId: hubNameId, opportunityId })],
    awaitRefetchQueries: true,
  });

  const onSubmit = async (values: any) => {
    const { id: apectId, ...rest } = values;
    if (!apectId && contextId) {
      return;
    } else {
      await updateAspect({
        variables: {
          input: {
            ID: apectId,
            ...rest,
          },
        },
      });
    }
  };

  let submitWired;

  return (
    <Dialog open={show} maxWidth="lg" fullWidth aria-labelledby="aspect-edit-dialog-title">
      <DialogTitle id="aspect-edit-dialog-title" onClose={onHide}>
        {t(`aspect-edit.${isCreate ? 'new' : 'edit'}` as const)}
      </DialogTitle>
      <DialogContent dividers className={styles.body}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={values => onSubmit(values)}
        >
          {({ values, handleChange, errors, touched, handleSubmit }) => {
            const getField = (name: string, label: string) => (
              <Grid item xs={12}>
                <TextArea
                  onChange={handleChange}
                  name={name}
                  value={values[name] as string}
                  label={label}
                  error={touched[name] && !!errors[name]}
                  className={styles.field}
                  rows={2}
                />
              </Grid>
            );

            if (!submitWired) {
              submitWired = handleSubmit;
            }

            return (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormikSelect
                    name={'title'}
                    title={'Aspect Type'}
                    values={availableTypes?.map(x => ({ id: x, name: replaceAll('_', ' ', x) })) || []}
                  />
                </Grid>
                {getField('framing', 'Framing')}
                {getField('explanation', 'Explanation')}
              </Grid>
            );
          }}
        </Formik>
      </DialogContent>
      <DialogActions>
        <Button type={'submit'} variant="primary" onClick={() => submitWired()} text={t('buttons.save')} />
      </DialogActions>
    </Dialog>
  );
};

export default AspectEdit;
