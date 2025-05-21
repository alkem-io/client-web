import { Form, Formik } from 'formik';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Box, Button } from '@mui/material';
import { TagsetReservedName, UpdateVirtualContributorInput } from '@/core/apollo/generated/graphql-schema';
import { nameSegmentSchema } from '@/domain/platform/admin/components/Common/NameSegment';
import { ProfileSegment, profileSegmentSchema } from '@/domain/platform/admin/components/Common/ProfileSegment';
import VisualUpload from '@/core/ui/upload/VisualUpload/VisualUpload';
import Gutters from '@/core/ui/grid/Gutters';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { Actions } from '@/core/ui/actions/Actions';
import { TagsetSegment } from '@/domain/platform/admin/components/Common/TagsetSegment';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { theme } from '@/core/ui/themes/default/Theme';
import GridContainer from '@/core/ui/grid/GridContainer';
import GridProvider from '@/core/ui/grid/GridProvider';
import GridItem from '@/core/ui/grid/GridItem';
import { useColumns } from '@/core/ui/grid/GridContext';
import { useBackToStaticPath } from '@/core/routing/useBackToPath';
import ProfileReferenceSegment from '@/domain/platform/admin/components/Common/ProfileReferenceSegment';
import { VisualModelFull } from '@/domain/common/visual/model/VisualModel';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { ProfileModel } from '@/domain/common/profile/ProfileModel';
import { mapTagsetModelsToUpdateTagsetInputs } from '@/domain/common/tagset/TagsetUtils';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';
import { mapReferenceModelsToUpdateReferenceInputs } from '@/domain/common/reference/ReferenceUtils';
import { SpaceBodyOfKnowledgeModel } from '../../virtualContributor/model/SpaceBodyOfKnowledgeModel';

type VirtualContributorProps = {
  id: string;
  account?: {
    host?: {
      profile: {
        displayName: string;
      };
    };
  };
  profile: ProfileModel;
};

type VirtualContributorFormValues = {
  name: string;
  description: string;
  tagline?: string;
  tagsets?: TagsetModel[];
  hostDisplayName: string;
  subSpaceName: string;
  references?: ReferenceModel[];
};

type VirtualContributorFormProps = {
  virtualContributor: VirtualContributorProps;
  bokProfile?: SpaceBodyOfKnowledgeModel;
  avatar: VisualModelFull | undefined;
  onSave?: (virtualContributor: UpdateVirtualContributorInput) => void;
  hasBackNavigation?: boolean;
};

export const VirtualContributorForm = ({
  virtualContributor,
  bokProfile,
  avatar,
  onSave,
  hasBackNavigation = true,
}: VirtualContributorFormProps) => {
  const { t } = useTranslation();
  const handleBack = useBackToStaticPath(virtualContributor.profile.url || '');
  const cols = useColumns();
  const isMobile = cols < 5;

  const {
    profile: { id: vcProfileId, displayName, description, tagline, tagsets, references: vcReferences },
    account,
  } = virtualContributor;

  const { displayName: subSpaceName } = bokProfile ?? {};

  const initialValues: VirtualContributorFormValues = useMemo(
    () => ({
      name: displayName,
      description: description ?? '',
      tagline: tagline,
      tagsets: tagsets,
      hostDisplayName: account?.host?.profile.displayName ?? '',
      subSpaceName: subSpaceName ?? '',
      references: vcReferences ?? [],
    }),
    [displayName, description, tagline, tagsets, account, subSpaceName, vcReferences]
  );

  const validationSchema = yup.object().shape({
    name: nameSegmentSchema.fields?.displayName ?? yup.string(),
    description: profileSegmentSchema.fields?.description ?? yup.string(),
  });

  // use keywords tagset (existing after creation of VC) as tags
  const keywordsTagsetWrapped = useMemo(() => {
    const tagset = tagsets?.find(x => x.name.toLowerCase() === TagsetReservedName.Keywords.toLowerCase());
    return tagset && [tagset];
  }, [tagsets]);

  const [handleSubmit, loading] = useLoadingState(async (values: VirtualContributorFormValues) => {
    const { tagsets, references, description, tagline, name, ...otherData } = values;

    const updatedVirtualContributor = {
      ID: virtualContributor.id,
      profileData: {
        displayName: name,
        description,
        tagline,
        tagsets: mapTagsetModelsToUpdateTagsetInputs(tagsets),
        references: mapReferenceModelsToUpdateReferenceInputs(references),
      },
      ...otherData,
    };

    await onSave?.(updatedVirtualContributor);
  });

  const HostFields = () => (
    <>
      <FormikInputField name="hostDisplayName" title="Host" required readOnly disabled />
      <FormikInputField
        name="subSpaceName"
        title={t('virtualContributorSpaceSettings.bodyOfKnowledge')}
        required
        readOnly
        disabled
      />
    </>
  );

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ values: { references, hostDisplayName }, handleSubmit }) => {
          return (
            <Form noValidate onSubmit={handleSubmit}>
              <GridContainer>
                <GridProvider columns={12}>
                  <GridItem columns={isMobile ? cols : 2}>
                    <Box display="flex" justifyContent="center">
                      <VisualUpload
                        visual={avatar}
                        altText={t('visuals-alt-text.avatar.contributor.text', {
                          displayName,
                          altText: avatar?.alternativeText,
                        })}
                      />
                    </Box>
                  </GridItem>
                  <GridItem columns={isMobile ? cols : 8}>
                    <Gutters>
                      <FormikInputField name="name" title={t('components.nameSegment.name')} />
                      <ProfileSegment />
                      {keywordsTagsetWrapped ? (
                        <TagsetSegment tagsets={keywordsTagsetWrapped} title={t('common.tags')} />
                      ) : null}

                      <ProfileReferenceSegment fullWidth profileId={vcProfileId} references={references ?? []} />

                      {hostDisplayName && <HostFields />}
                      <Actions marginTop={theme.spacing(2)} sx={{ justifyContent: 'end' }}>
                        {hasBackNavigation && (
                          <Button onClick={handleBack} variant="text">
                            {t('buttons.back')}
                          </Button>
                        )}
                        <Button loading={loading} type="submit" variant="contained">
                          {t('buttons.save')}
                        </Button>
                      </Actions>
                    </Gutters>
                  </GridItem>
                </GridProvider>
              </GridContainer>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default VirtualContributorForm;
