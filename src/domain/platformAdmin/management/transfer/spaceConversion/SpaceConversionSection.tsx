import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import Gutters from '@/core/ui/grid/Gutters';
import Loading from '@/core/ui/loading/Loading';
import { BlockSectionTitle, BlockTitle, Caption } from '@/core/ui/typography';
import { FormikSubmitButtonPure } from '@/domain/shared/components/forms/FormikSubmitButton';
import SpaceConversionOperations from './SpaceConversionOperations';
import useSpaceConversion from './useSpaceConversion';

const T_PREFIX = 'pages.admin.spaceConversion';

const SpaceConversionSection = () => {
  const { t } = useTranslation();

  const {
    space,
    resolvedLevel,
    accountOwnerName,
    communityCounts,
    siblingSubspaces,
    siblingsLoading,
    loading,
    mutationLoading,
    error,
    handleResolve,
    handlePromoteL1ToL0,
    handleDemoteL1ToL2,
    handlePromoteL2ToL1,
  } = useSpaceConversion();

  const urlValidator = yup.object().shape({
    url: yup.string().required(t(`${T_PREFIX}.urlRequired`)),
  });

  const onSubmit = ({ url }: { url: string }) => {
    handleResolve(url);
    return Promise.resolve();
  };

  return (
    <PageContentBlock>
      <BlockTitle>{t(`${T_PREFIX}.sectionTitle`)}</BlockTitle>
      <PageContentBlockSeamless disablePadding={true}>
        <Formik initialValues={{ url: '' }} validationSchema={urlValidator} onSubmit={onSubmit}>
          {formik => (
            <Form>
              <Gutters row={true} disablePadding={true}>
                <FormikInputField
                  name="url"
                  title={t(`${T_PREFIX}.sectionTitle`)}
                  placeholder={t(`${T_PREFIX}.urlPlaceholder`)}
                  fullWidth={true}
                />
                <FormikSubmitButtonPure formik={formik}>{t(`${T_PREFIX}.resolve`)}</FormikSubmitButtonPure>
              </Gutters>
            </Form>
          )}
        </Formik>
      </PageContentBlockSeamless>
      {loading && <Loading />}
      {error && <Caption color="error">{t(error)}</Caption>}
      {space && resolvedLevel !== undefined && (
        <PageContentBlock>
          <Gutters disablePadding={true}>
            <BlockSectionTitle>{t(`${T_PREFIX}.spaceName`)}</BlockSectionTitle>
            <span>{space.about.profile.displayName}</span>
          </Gutters>
          <Gutters disablePadding={true}>
            <BlockSectionTitle>{t(`${T_PREFIX}.spaceLevel`)}</BlockSectionTitle>
            <span>{resolvedLevel}</span>
          </Gutters>
          {accountOwnerName && (
            <Gutters disablePadding={true}>
              <BlockSectionTitle>{t(`${T_PREFIX}.accountOwner`)}</BlockSectionTitle>
              <span>{accountOwnerName}</span>
            </Gutters>
          )}
          {communityCounts && (
            <Gutters disablePadding={true}>
              <BlockSectionTitle>{t(`${T_PREFIX}.communityMembers`)}</BlockSectionTitle>
              <span>
                {communityCounts.memberUsers} members, {communityCounts.leadUsers} leads,{' '}
                {communityCounts.memberOrganizations} orgs, {communityCounts.virtualContributors} VCs
              </span>
            </Gutters>
          )}
          <SpaceConversionOperations
            level={resolvedLevel}
            siblingSubspaces={siblingSubspaces}
            siblingsLoading={siblingsLoading}
            mutationLoading={mutationLoading}
            onPromoteL1ToL0={handlePromoteL1ToL0}
            onDemoteL1ToL2={handleDemoteL1ToL2}
            onPromoteL2ToL1={handlePromoteL2ToL1}
          />
        </PageContentBlock>
      )}
    </PageContentBlock>
  );
};

export default SpaceConversionSection;
