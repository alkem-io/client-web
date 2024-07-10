import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { useAuthorizationPrivilegesForUserQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { Form, Formik } from 'formik';
import { useMemo, useState } from 'react';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { FormikSubmitButtonPure } from '../../../../domain/shared/components/forms/FormikSubmitButton';
import { Chip, DialogContent } from '@mui/material';
import Loading from '../../../../core/ui/loading/Loading';
import Gutters from '../../../../core/ui/grid/Gutters';
import * as yup from 'yup';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { Identifiable } from '../../../../core/utils/Identifiable';

interface AuthorizationDialogProps {
  user:
    | undefined
    | (Identifiable & {
        profile: {
          displayName: string;
        };
      });
  onClose: () => void;
}

const AuthorizationPrivilegesForUserDialog = ({ user, onClose }: AuthorizationDialogProps) => {
  const [authorizationId, setAuthorizationId] = useState<string>('');

  const { data, loading } = useAuthorizationPrivilegesForUserQuery({
    variables: {
      authorizationId,
      userId: user?.id!,
    },
    skip: !authorizationId || !user,
  });

  const handleSubmit = ({ authorizationId }: { authorizationId: string }) => {
    setAuthorizationId(authorizationId);
    return Promise.resolve();
  };

  const initialValues = useMemo<{ authorizationId: string }>(
    () => ({
      authorizationId: '',
    }),
    [user?.id]
  );

  const validator = yup.object().shape({
    authorizationId: yup.string().required(),
  });

  const handleClose = () => {
    onClose();
    setAuthorizationId('');
  };

  return (
    <DialogWithGrid columns={8} open={!!user} onClose={handleClose}>
      <DialogHeader title={`Authorization Privileges for User ${user?.profile.displayName}`} onClose={handleClose} />
      <DialogContent>
        <Formik initialValues={initialValues} validator={validator} onSubmit={handleSubmit}>
          {formik => (
            <Form>
              <Gutters row disablePadding>
                <FormikInputField name="authorizationId" title="Authorization ID" fullWidth />
                <FormikSubmitButtonPure formik={formik}>Get Authorization Privileges</FormikSubmitButtonPure>
              </Gutters>
            </Form>
          )}
        </Formik>
        <Gutters row paddingX={0} paddingBottom={0} flexWrap="wrap">
          {loading && <Loading />}
          {!loading &&
            data?.lookup.authorizationPrivilegesForUser?.map(privilege => (
              <Chip size="medium" key={privilege} label={privilege} />
            ))}
        </Gutters>
      </DialogContent>
    </DialogWithGrid>
  );
};

export default AuthorizationPrivilegesForUserDialog;
