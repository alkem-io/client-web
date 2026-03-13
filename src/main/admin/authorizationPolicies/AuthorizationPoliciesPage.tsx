import { Chip, Divider } from '@mui/material';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useAuthorizationPolicyQuery } from '@/core/apollo/generated/apollo-hooks';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import Loading from '@/core/ui/loading/Loading';
import { BlockSectionTitle, BlockTitle, Caption } from '@/core/ui/typography';
import { AdminSection, adminTabs } from '@/domain/platformAdmin/layout/toplevel/constants';
import { FormikSubmitButtonPure } from '@/domain/shared/components/forms/FormikSubmitButton';
import HeaderNavigationTab from '@/domain/shared/components/PageHeader/HeaderNavigationTab';
import HeaderNavigationTabs from '@/domain/shared/components/PageHeader/HeaderNavigationTabs';
import { joinNodes } from '@/domain/shared/utils/joinNodes';
import SpacePageBanner from '@/domain/space/layout/tabbedLayout/layout/SpacePageBanner';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import AdminBreadcrumbs from '../AdminBreadcrumbs';
import AuthorizationPrivilegesForUser from './AuthorizationPrivilegesForUser';

const currentTab = AdminSection.AuthorizationPolicies;

const AuthorizationPoliciesPage = () => {
  const { t } = useTranslation();

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
    authorizationPolicyId: textLengthValidator({ required: true }),
  });

  const initialValues = {
    authorizationPolicyId: '',
  } as const;

  const authorizationPolicy = data?.lookup.authorizationPolicy;

  return (
    <TopLevelLayout
      header={
        <>
          <SpacePageBanner title={t('common.administration')} isAdmin={true} />
          <HeaderNavigationTabs value={currentTab} defaultTab={AdminSection.Space}>
            {adminTabs.map(tab => {
              return (
                <HeaderNavigationTab
                  key={tab.route}
                  label={t(`common.${tab.section}` as const)}
                  value={tab.section}
                  to={tab.route}
                />
              );
            })}
          </HeaderNavigationTabs>
        </>
      }
      breadcrumbs={<AdminBreadcrumbs />}
    >
      <PageContent>
        <PageContentColumn columns={12}>
          <PageContentBlockSeamless disablePadding={true}>
            <Formik initialValues={initialValues} validator={validator} onSubmit={handleSubmit}>
              {formik => (
                <Form>
                  <Gutters row={true} disablePadding={true}>
                    <FormikInputField name="authorizationPolicyId" title="Authorization Policy ID" fullWidth={true} />
                    <FormikSubmitButtonPure formik={formik}>Get Authorization Policy</FormikSubmitButtonPure>
                  </Gutters>
                </Form>
              )}
            </Formik>
          </PageContentBlockSeamless>
        </PageContentColumn>
        <PageContentColumn columns={6}>
          {authorizationPolicy && (
            <PageContentBlock>
              <Gutters paddingX={0} paddingBottom={0} flexWrap="wrap">
                {loading && <Loading />}
                {!loading && !!authorizationPolicyId && (
                  <>
                    <Gutters row={true} disablePadding={true}>
                      <BlockTitle>Type</BlockTitle>
                      <Chip label={authorizationPolicy.type} />
                      <Divider />
                    </Gutters>
                    <Gutters disablePadding={true}>
                      {authorizationPolicy?.credentialRules && (
                        <>
                          <BlockTitle>Credential Rules</BlockTitle>
                          {joinNodes(
                            authorizationPolicy.credentialRules.map(rule => (
                              <Gutters disablePadding={true} paddingLeft={gutters(2)}>
                                <Caption>{rule.name}</Caption>
                                <Gutters row={true} disablePadding={true}>
                                  <BlockSectionTitle>Cascade</BlockSectionTitle>
                                  <Chip label={rule.cascade ? 'TRUE' : 'FALSE'} />
                                </Gutters>
                                <Gutters row={true} disablePadding={true}>
                                  <Caption>Granted Privileges</Caption>
                                  {rule.grantedPrivileges.map(privilege => (
                                    <Chip key={privilege} label={privilege} />
                                  ))}
                                </Gutters>
                                <Gutters row={true} disablePadding={true}>
                                  <Caption>Criteria</Caption>
                                  <div>
                                    {rule.criterias.map((criteria, i) => (
                                      <Gutters row={true} disablePadding={true} paddingBottom={gutters(0.5)} key={i}>
                                        <Chip label={criteria.type} />
                                        {criteria.resourceID && <Chip label={criteria.resourceID} />}
                                      </Gutters>
                                    ))}
                                  </div>
                                </Gutters>
                              </Gutters>
                            )),
                            Divider
                          )}
                        </>
                      )}
                    </Gutters>
                    <Gutters disablePadding={true}>
                      {authorizationPolicy?.privilegeRules && (
                        <>
                          <BlockTitle>Privilege Rules</BlockTitle>
                          {joinNodes(
                            authorizationPolicy.privilegeRules.map(rule => (
                              <Gutters disablePadding={true} paddingLeft={gutters(2)}>
                                <Caption>{rule.name}</Caption>
                                <Gutters row={true} disablePadding={true}>
                                  <BlockSectionTitle>Source Privilege</BlockSectionTitle>
                                  <Chip label={rule.sourcePrivilege} />
                                </Gutters>
                                <Gutters row={true} disablePadding={true}>
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
            </PageContentBlock>
          )}
        </PageContentColumn>
        <PageContentColumn columns={6}>
          {authorizationPolicy && (
            <PageContentBlock>
              <AuthorizationPrivilegesForUser authorizationPolicyId={authorizationPolicyId} />
            </PageContentBlock>
          )}
        </PageContentColumn>
      </PageContent>
    </TopLevelLayout>
  );
};

export default AuthorizationPoliciesPage;
