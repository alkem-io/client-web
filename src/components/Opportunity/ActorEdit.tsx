import React, { FC } from 'react';
import { Modal } from 'react-bootstrap';
import Button from '../core/Button';
import { ActorInput, useRemoveActorMutation, useUpdateActorMutation } from '../../generated/graphql';
import * as yup from 'yup';
import { Formik } from 'formik';
import TextInput, { TextArea } from '../core/TextInput';
import { createStyles } from '../../hooks/useTheme';
import { QUERY_OPPORTUNITY_ACTOR_GROUPS } from '../../graphql/opportunity';

interface Props {
  show: boolean;
  onHide: () => void;
  data: ActorInput;
  id: string;
  opportunityId: string | undefined;
}

const useContextEditStyles = createStyles(theme => ({
  field: {
    marginBottom: theme.shape.spacing(2),
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

const ActorEdit: FC<Props> = ({ show, onHide, data, id, opportunityId }) => {
  const styles = useContextEditStyles();

  const initialValues: ActorInput = {
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

  const [updateActor] = useUpdateActorMutation({
    onCompleted: () => onHide(),
    onError: e => console.error(e),
    refetchQueries: [{ query: QUERY_OPPORTUNITY_ACTOR_GROUPS, variables: { id: Number(opportunityId) } }],
    awaitRefetchQueries: true,
  });

  const [removeActor] = useRemoveActorMutation({
    onCompleted: () => onHide(),
    onError: e => console.error(e),
    refetchQueries: [{ query: QUERY_OPPORTUNITY_ACTOR_GROUPS, variables: { id: Number(opportunityId) } }],
    awaitRefetchQueries: true,
  });

  const onSubmit = values => {
    updateActor({
      variables: {
        ID: Number(id),
        actorData: values,
      },
    });
  };

  const onRemove = () => removeActor({ variables: { ID: Number(id) } });

  let submitWired;

  return (
    <Modal show={show} onHide={onHide} centered size={'xl'}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Actor</Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.body}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={values => onSubmit(values)}
        >
          {({ values, handleChange, errors, handleSubmit }) => {
            const getField = (name: string, label: string, type?: 'input' | 'textArea') => (
              <>
                {type === 'input' ? (
                  <TextInput
                    onChange={handleChange}
                    name={name}
                    value={values[name] as string}
                    label={label}
                    error={!!errors[name]}
                    className={styles.field}
                  />
                ) : (
                  <TextArea
                    onChange={handleChange}
                    name={name}
                    value={values[name] as string}
                    label={label}
                    error={!!errors[name]}
                    className={styles.field}
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
      </Modal.Body>
      <Modal.Footer>
        <Button variant="negative" onClick={onRemove} className={'mr-2'}>
          REMOVE ACTOR
        </Button>
        <div className="flex-grow-1" />
        <Button variant="negative" onClick={onHide} className={'mr-2'}>
          CANCEL
        </Button>
        <Button type={'submit'} variant="primary" onClick={() => submitWired()}>
          SAVE
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ActorEdit;
