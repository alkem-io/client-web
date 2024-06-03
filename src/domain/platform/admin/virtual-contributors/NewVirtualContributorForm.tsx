import { useMemo } from 'react';
import { Form, Formik } from 'formik';
import Gutters from '../../../../core/ui/grid/Gutters';
import { useTranslation } from 'react-i18next';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import useLoadingState from '../../../shared/utils/useLoadingState';
import {
  refetchAdminVirtualContributorsQuery,
  useCreateVirtualContributorMutation,
  useVirtualContributorAvailablePersonasQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { Actions } from '../../../../core/ui/actions/Actions';
import { Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { v4 as uuidv4 } from 'uuid';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import AdminLayout from '../layout/toplevel/AdminLayout';
import { AdminSection } from '../layout/toplevel/constants';
import FormikSelect from '../../../../core/ui/forms/FormikSelect';
import { useBackToStaticPath } from '../../../../core/routing/useBackToPath';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { TagsetSegment } from '../components/Common/TagsetSegment';
import { Tagset, TagsetType } from '../../../../core/apollo/generated/graphql-schema';
import { DEFAULT_TAGSET } from '../../../common/tags/tagset.constants';
import { SMALL_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import { BodyOfKnowledgeType } from '../../../../core/apollo/generated/graphql-schema';

interface NewVirtualContributorFormValues {
  displayName: string;
  virtualPersonaID: string;
  tagline: string;
  tagsets: Tagset[];
}

interface NewVirtualContributorFormProps {
  parentPagePath: string;
}

const NewVirtualContributorForm = ({ parentPagePath }: NewVirtualContributorFormProps) => {
  const { t } = useTranslation();
  const navigateBack = useBackToStaticPath(parentPagePath);
  const notify = useNotification();
  const initialValues = { displayName: '', virtualPersonaID: '', tagline: '', tagsets: [] };
  const { data: virtualPersonas } = useVirtualContributorAvailablePersonasQuery();
  const [createVirtualContributor, { loading }] = useCreateVirtualContributorMutation({
    refetchQueries: [refetchAdminVirtualContributorsQuery()],
  });

  const onCancel = () => {
    navigateBack();
  };

  const [handleSubmit] = useLoadingState(async (values: NewVirtualContributorFormValues) => {
    const { displayName, virtualPersonaID, tagline, tagsets } = values;

    // TODO: fix accountID: '' & bodyOfKnowledgeID: '' in order to work
    await createVirtualContributor({
      variables: {
        virtualContributorData: {
          virtualPersonaID,
          nameID: `V-P-${uuidv4()}`.slice(0, 25).toLocaleLowerCase(),
          profileData: {
            displayName,
            tagline,
            tagsets: [
              {
                ...tagsets[0],
                name: DEFAULT_TAGSET,
              },
            ],
          },
          accountID: '',
          bodyOfKnowledgeID: '',
          bodyOfKnowledgeType: BodyOfKnowledgeType.Space,
        },
      },
    });

    notify('Virtual Contributor Created Successfully!', 'success');
    navigateBack();
  });

  const personas = useMemo(
    () =>
      virtualPersonas?.virtualPersonas.map(persona => ({
        id: persona.id,
        name: `${persona.profile.displayName}${persona.profile.description && ` - ${persona.profile.description}`}`,
      })),
    [virtualPersonas]
  );

  const tagsets = [
    {
      id: '',
      name: DEFAULT_TAGSET,
      tags: [],
      allowedValues: [],
      type: TagsetType.Freeform,
    },
  ] as Tagset[];

  return (
    <AdminLayout currentTab={AdminSection.VirtualContributors}>
      <PageContentBlock>
        <PageContentBlockHeader title="Create Virtual Contributor" />
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          <Form>
            <Gutters disablePadding>
              <FormikInputField title={t('common.title')} name="displayName" />
              <FormikSelect title="Select Virtual Persona" name="virtualPersonaID" values={personas ?? []} />
              <FormikInputField
                name={'tagline'}
                title={t('context.space.tagline.title')}
                rows={3}
                maxLength={SMALL_TEXT_LENGTH}
              />
              <TagsetSegment title={t('common.tags')} tagsets={tagsets} />
              <Actions>
                <Button variant="text" onClick={onCancel}>
                  {t('buttons.cancel')}
                </Button>
                <LoadingButton loading={loading} type="submit" variant="contained">
                  {t('buttons.save')}
                </LoadingButton>
              </Actions>
            </Gutters>
          </Form>
        </Formik>
      </PageContentBlock>
    </AdminLayout>
  );
};

export default NewVirtualContributorForm;
