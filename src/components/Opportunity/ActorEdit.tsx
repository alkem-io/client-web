import { Formik } from 'formik';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@material-ui/core/Dialog';
import * as yup from 'yup';
import {
  refetchOpportunityActorGroupsQuery,
  useCreateActorMutation,
  useUpdateActorMutation,
} from '../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../hooks';
import { useEcoverse } from '../../hooks';
import { createStyles } from '../../hooks/useTheme';
import { Actor } from '../../models/graphql-schema';
import Button from '../core/Button';
import TextInput, { TextArea } from '../core/TextInput';
import { DialogActions, DialogContent, DialogTitle } from '../core/dialog';

interface Props {
  show: boolean;
  onHide: () => void;
  data?: Actor;
  id?: string;
  opportunityId: string;
  actorGroupId?: string;
  isCreate?: boolean;
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

const ActorEdit: FC<Props> = ({ show, onHide, data, id, opportunityId, actorGroupId }) => {
  const { t } = useTranslation();
  const { ecoverseNameId } = useEcoverse();
  const styles = useContextEditStyles();
  const handleError = useApolloErrorHandler();

  const initialValues: Actor = {
    id: id || '',
    name: data?.name || '',
    description: data?.description || '',
    value: data?.value || '',
    impact: data?.impact || '',
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required(),
    description: yup.string().required(),
    value: yup.string().required(),
    impact: yup.string().required(),
  });

  const [createActor] = useCreateActorMutation({
    onCompleted: () => onHide(),
    onError: handleError,
    refetchQueries: [refetchOpportunityActorGroupsQuery({ ecoverseId: ecoverseNameId, opportunityId })],
    awaitRefetchQueries: true,
  });

  const [updateActor] = useUpdateActorMutation({
    onCompleted: () => onHide(),
    onError: handleError,
    awaitRefetchQueries: true,
  });

  const onSubmit = (values: Actor) => {
    const { id: actorId, __typename, ...rest } = values;
    if (!actorId && actorGroupId) {
      createActor({
        variables: {
          input: {
            actorGroupID: actorGroupId,
            ...rest,
          },
        },
      });

      return;
    }
    if (actorId) {
      updateActor({
        variables: {
          input: {
            ID: actorId,
            ...rest,
          },
        },
      });
    }
  };

  let submitWired;

  return (
    <Dialog open={show} maxWidth="lg" fullWidth aria-labelledby="actor-edit-dialog-title">
      <DialogTitle id="actor-edit-dialog-title" onClose={onHide}>
        {!id ? 'Create' : 'Edit'} Actor
      </DialogTitle>
      <DialogContent dividers className={styles.body}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={values => onSubmit(values)}
        >
          {({ values, handleChange, errors, handleSubmit, touched }) => {
            const getField = (name: string, label: string, type?: 'input' | 'textArea') => (
              <>
                {type === 'input' ? (
                  <TextInput
                    onChange={handleChange}
                    name={name}
                    value={values[name] as string}
                    label={label}
                    error={touched[name] && !!errors[name]}
                    className={styles.field}
                  />
                ) : (
                  <TextArea
                    onChange={handleChange}
                    name={name}
                    value={values[name] as string}
                    label={label}
                    error={touched[name] && !!errors[name]}
                    className={styles.field}
                    rows={2}
                  />
                )}
              </>
            );

            if (!submitWired) {
              submitWired = handleSubmit;
            }

            return (
              <>
                {getField('name', 'Name', 'input')}
                {getField('description', 'Description')}
                {getField('value', 'Value')}
                {getField('impact', 'Impact')}
              </>
            );
          }}
        </Formik>
      </DialogContent>
      <DialogActions>
        <Button
          type={'submit'}
          variant="primary"
          onClick={() => submitWired()}
          text={t(`buttons.${!id ? 'create' : 'save'}` as const)}
        />
      </DialogActions>
    </Dialog>
  );
};

export default ActorEdit;
