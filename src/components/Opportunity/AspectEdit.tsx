import { Formik } from 'formik';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-bootstrap';
import Dialog from '@material-ui/core/Dialog';
import * as yup from 'yup';
import {
  refetchOpportunityActorGroupsQuery,
  useCreateAspectMutation,
  useOpportunityProfileQuery,
  useOpportunityTemplateQuery,
  useUpdateAspectMutation,
} from '../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../hooks';
import { useEcoverse } from '../../hooks';
import { createStyles } from '../../hooks/useTheme';
import { Aspect } from '../../models/graphql-schema';
import { replaceAll } from '../../utils/replaceAll';
import Button from '../core/Button';
import { Loading } from '../core';
import { TextArea } from '../core/TextInput';
import { DialogActions, DialogContent, DialogTitle } from '../core/dialog';

interface Props {
  show: boolean;
  onHide: () => void;
  data?: Aspect;
  id?: string;
  opportunityId: string;
  actorGroupId?: string;
  isCreate?: boolean;
  existingAspectNames?: string[];
}

const useContextEditStyles = createStyles(theme => ({
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

const AspectEdit: FC<Props> = ({ show, onHide, data, id, opportunityId, existingAspectNames }) => {
  const { t } = useTranslation();
  const { ecoverseId } = useEcoverse();
  const styles = useContextEditStyles();
  const handleError = useApolloErrorHandler();
  const { data: config } = useOpportunityTemplateQuery();
  const { data: opportunity, loading: loadingOpportunity } = useOpportunityProfileQuery({
    variables: { ecoverseId, opportunityId },
  });
  const contextId = opportunity?.ecoverse?.opportunity?.context?.id;
  const aspectsTypes = config?.configuration.template.opportunities[0].aspects;
  const isCreate = !id;

  const availableTypes =
    isCreate && existingAspectNames
      ? aspectsTypes?.filter(at => !existingAspectNames.includes(replaceAll('_', ' ', at)))
      : aspectsTypes;

  const initialValues: Aspect = {
    id: id || '',
    title: (isCreate ? availableTypes && availableTypes[0] : data?.title) || '',
    framing: data?.framing || '',
    explanation: data?.explanation || '',
  };
  const validationSchema = yup.object().shape({
    title: yup.string().required(),
    framing: yup.string().required(),
    explanation: yup.string().required(),
  });

  const [updateAspect] = useUpdateAspectMutation({
    onCompleted: () => onHide(),
    onError: handleError,
    refetchQueries: [refetchOpportunityActorGroupsQuery({ ecoverseId, opportunityId })],
    awaitRefetchQueries: true,
  });

  const [createAspect] = useCreateAspectMutation({
    onCompleted: () => onHide(),
    onError: handleError,
    refetchQueries: [refetchOpportunityActorGroupsQuery({ ecoverseId, opportunityId })],
    awaitRefetchQueries: true,
  });

  const onSubmit = async (values: Aspect) => {
    const { id: apectId, ...rest } = values;
    if (!apectId && contextId) {
      await createAspect({
        variables: {
          input: {
            parentID: contextId,
            ...rest,
          },
        },
      });

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

  if (loadingOpportunity) return <Loading text={'Loading opportunity'} />;

  return (
    <Dialog open={show} maxWidth="lg" fullWidth aria-labelledby="aspect-edit-dialog-title">
      <DialogTitle id="aspect-edit-dialog-title" onClose={onHide}>
        Edit Aspect
      </DialogTitle>
      <DialogContent dividers className={styles.body}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={values => onSubmit(values)}
        >
          {({ values, handleChange, errors, touched, handleSubmit, setFieldValue }) => {
            const getField = (name: string, label: string) => (
              <TextArea
                onChange={handleChange}
                name={name}
                value={values[name] as string}
                label={label}
                error={touched[name] && !!errors[name]}
                className={styles.field}
                rows={2}
              />
            );

            if (!submitWired) {
              submitWired = handleSubmit;
            }

            return (
              <>
                <Form.Group controlId="aspectTypeSelect">
                  <Form.Label>Aspect Type</Form.Label>
                  <Form.Control
                    as="select"
                    custom
                    onChange={e => {
                      e.preventDefault();
                      setFieldValue('title', e.target.value);
                    }}
                    size={'lg'}
                    disabled={!isCreate}
                    defaultValue={values.title ? replaceAll('_', ' ', values.title) : values.title}
                  >
                    {availableTypes?.map((at, index) => (
                      <option value={at} key={index}>
                        {replaceAll('_', ' ', at)}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                {getField('framing', 'Framing')}
                {getField('explanation', 'Explanation')}
              </>
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
