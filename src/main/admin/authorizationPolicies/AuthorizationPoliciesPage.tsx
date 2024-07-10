import { useState } from 'react';
import { useAuthorizationPolicyQuery } from '../../../core/apollo/generated/apollo-hooks';
import AdminLayout from '../../../domain/platform/admin/layout/toplevel/AdminLayout';
import { AdminSection } from '../../../domain/platform/admin/layout/toplevel/constants';
import { Form, Formik } from 'formik';
import Gutters from '../../../core/ui/grid/Gutters';
import FormikInputField from '../../../core/ui/forms/FormikInputField/FormikInputField';
import { FormikSubmitButtonPure } from '../../../domain/shared/components/forms/FormikSubmitButton';
import Loading from '../../../core/ui/loading/Loading';
import { Chip, Divider } from '@mui/material';
import * as yup from 'yup';
import { BlockSectionTitle, BlockTitle, Caption } from '../../../core/ui/typography';
import { joinNodes } from '../../../domain/shared/utils/joinNodes';
import { gutters } from '../../../core/ui/grid/utils';

const AuthorizationPoliciesPage = () => {
  const [authorizationPolicyId, setAuthorizationPolicyId] = useState<string>('');

  const { data, loading } = useAuthorizationPolicyQuery({
    variables: {
      authorizationPolicyId,
    },
    skip: !authorizationPolicyId,
  });

  const handleSubmit = ({ authorizationPolicyId }: { authorizationPolicyId: string }) => {
    setAuthorizationPolicyId(authorizationPolicyId);
    return Promise.resolve();
  };

  const validator = yup.object().shape({
    authorizationPolicyId: yup.string().required(),
  });

  const initialValues = {
    authorizationPolicyId: '',
  } as const;

  const authorizationPolicy = data?.lookup.authorizationPolicy;

  return (
    <AdminLayout currentTab={AdminSection.AuthorizationPolicies}>
      <Formik initialValues={initialValues} validator={validator} onSubmit={handleSubmit}>
        {formik => (
          <Form>
            <Gutters row disablePadding>
              <FormikInputField name="authorizationPolicyId" title="Authorization Policy ID" fullWidth />
              <FormikSubmitButtonPure formik={formik}>Get Authorization Policy</FormikSubmitButtonPure>
            </Gutters>
          </Form>
        )}
      </Formik>
      <Gutters paddingX={0} paddingBottom={0} flexWrap="wrap">
        {loading && <Loading />}
        {!loading && !!authorizationPolicyId && (
          <>
            <Gutters row disablePadding>
              <BlockTitle>Anonymous Read Access</BlockTitle>
              <Chip label={authorizationPolicy?.anonymousReadAccess ? 'TRUE' : 'FALSE'} />
              <Divider />
            </Gutters>
            <Gutters disablePadding>
              {authorizationPolicy?.credentialRules && (
                <>
                  <BlockTitle>Credential Rules</BlockTitle>
                  {joinNodes(
                    authorizationPolicy.credentialRules.map(rule => (
                      <Gutters disablePadding paddingLeft={gutters(2)}>
                        <Caption>{rule.name}</Caption>
                        <Gutters row disablePadding>
                          <BlockSectionTitle>Cascade</BlockSectionTitle>
                          <Chip label={rule.cascade ? 'TRUE' : 'FALSE'} />
                        </Gutters>
                        <Gutters row disablePadding>
                          <Caption>Granted Privileges</Caption>
                          {rule.grantedPrivileges.map(privilege => (
                            <Chip key={privilege} label={privilege} />
                          ))}
                        </Gutters>
                      </Gutters>
                    )),
                    Divider
                  )}
                </>
              )}
            </Gutters>
            <Gutters disablePadding>
              {authorizationPolicy?.privilegeRules && (
                <>
                  <BlockTitle>Privilege Rules</BlockTitle>
                  {joinNodes(
                    authorizationPolicy.privilegeRules.map(rule => (
                      <Gutters disablePadding paddingLeft={gutters(2)}>
                        <Caption>{rule.name}</Caption>
                        <Gutters row disablePadding>
                          <BlockSectionTitle>Source Privilege</BlockSectionTitle>
                          <Chip label={rule.sourcePrivilege} />
                        </Gutters>
                        <Gutters row disablePadding>
                          <BlockSectionTitle>Granted Privileges</BlockSectionTitle>
                          {rule.grantedPrivileges.map(privilege => (
                            <Chip key={privilege} label={privilege} />
                          ))}
                        </Gutters>
                      </Gutters>
                    )),
                    Divider
                  )}
                </>
              )}
            </Gutters>
          </>
        )}
      </Gutters>
    </AdminLayout>
  );
};

export default AuthorizationPoliciesPage;
