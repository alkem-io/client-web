import { Form, Formik } from 'formik';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Box, Button } from '@mui/material';
import { TagsetReservedName, UpdateVirtualContributorInput } from '@/core/apollo/generated/graphql-schema';
import { nameSegmentSchema } from '@/domain/platformAdmin/components/Common/NameSegment';
import { ProfileSegment, profileSegmentSchema } from '@/domain/platformAdmin/components/Common/ProfileSegment';
import VisualUpload from '@/core/ui/upload/VisualUpload/VisualUpload';
import Gutters from '@/core/ui/grid/Gutters';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { Actions } from '@/core/ui/actions/Actions';
import { TagsetSegment, tagsetsSegmentSchema } from '@/domain/platformAdmin/components/Common/TagsetSegment';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { theme } from '@/core/ui/themes/default/Theme';
import GridContainer from '@/core/ui/grid/GridContainer';
import GridProvider from '@/core/ui/grid/GridProvider';
import GridItem from '@/core/ui/grid/GridItem';
import { useColumns } from '@/core/ui/grid/GridContext';
import { useBackToStaticPath } from '@/core/routing/useBackToPath';
import ProfileReferenceSegment from '@/domain/platformAdmin/components/Common/ProfileReferenceSegment';
import { VisualModelFull } from '@/domain/common/visual/model/VisualModel';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { ProfileModel } from '@/domain/common/profile/ProfileModel';
import { mapTagsetModelsToUpdateTagsetInputs } from '@/domain/common/tagset/TagsetUtils';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';
import { mapReferenceModelsToUpdateReferenceInputs } from '@/domain/common/reference/ReferenceUtils';
import { SpaceBodyOfKnowledgeModel } from '../../virtualContributor/model/SpaceBodyOfKnowledgeModel';
import { nameOf } from '@/core/utils/nameOf';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import { referenceSegmentValidationObject } from '@/domain/platformAdmin/components/Common/ReferenceSegment';
import { ALT_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';

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
  profile: {
    displayName: string;
    description: string;
    tagline?: string;
    tagsets?: TagsetModel[];
    references?: ReferenceModel[];
  };
  hostDisplayName: string;
  subSpaceName: string;
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
      profile: {
        displayName: displayName,
        description: description ?? '',
        tagline: tagline,
        tagsets: tagsets,
        references: vcReferences ?? [],
      },
      hostDisplayName: account?.host?.profile.displayName ?? '',
      subSpaceName: subSpaceName ?? '',
    }),
    [displayName, description, tagline, tagsets, account, subSpaceName, vcReferences]
  );

  const validationSchema = yup.object().shape({
    profile: yup.object().shape({
      displayName: nameSegmentSchema.fields?.displayName ?? textLengthValidator({ required: true }),
      description: profileSegmentSchema.fields?.description ?? textLengthValidator({ required: true }),
      tagline: profileSegmentSchema.fields?.tagline ?? textLengthValidator({ maxLength: ALT_TEXT_LENGTH }).nullable(),
      tagsets: tagsetsSegmentSchema,
      references: yup.array().of(referenceSegmentValidationObject),
    }),
    hostDisplayName: textLengthValidator(),
    subSpaceName: textLengthValidator(),
  });

  const getUpdatedTagsets = (updatedTagsets: TagsetModel[]) => {
    const result: TagsetModel[] = [];
    updatedTagsets.forEach(updatedTagset => {
      const originalTagset = tagsets?.find(value => value.name === updatedTagset.name);
      if (originalTagset) {
        result.push({ ...originalTagset, tags: updatedTagset.tags });
      }
    });

    return result;
  };

  const [handleSubmit, loading] = useLoadingState(async (values: VirtualContributorFormValues) => {
    const { profile, ...otherData } = values;
    const { displayName, description, tagline, tagsets, references } = profile;
    const updatedTagsets = getUpdatedTagsets(tagsets ?? []);

    const updatedVirtualContributor = {
      ID: virtualContributor.id,
      profileData: {
        displayName,
        description,
        tagline,
        tagsets: mapTagsetModelsToUpdateTagsetInputs(updatedTagsets),
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
        {({
          values: {
            profile: { tagsets, references },
            hostDisplayName,
          },
          handleSubmit,
        }) => {
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
                      <FormikInputField name="profile.displayName" title={t('components.nameSegment.name')} />
                      <ProfileSegment />
                      {/* use keywords tagset (existing after creation of VC) as tags */}
                      {tagsets?.find(tagset => tagset.name.toLowerCase() === TagsetReservedName.Keywords) ? (
                        <TagsetSegment
                          name={nameOf<VirtualContributorFormValues>('profile.tagsets')}
                          title={t('common.tags')}
                        />
                      ) : null}
                      <ProfileReferenceSegment
                        fullWidth
                        fieldName="profile.references"
                        profileId={vcProfileId}
                        references={references ?? []}
                      />
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
