import { Box, Button } from '@mui/material';
import { Form, Formik } from 'formik';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { TagsetReservedName, type UpdateVirtualContributorInput } from '@/core/apollo/generated/graphql-schema';
import { useBackToStaticPath } from '@/core/routing/useBackToPath';
import { Actions } from '@/core/ui/actions/Actions';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { ALT_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import GridContainer from '@/core/ui/grid/GridContainer';
import { useColumns } from '@/core/ui/grid/GridContext';
import GridItem from '@/core/ui/grid/GridItem';
import GridProvider from '@/core/ui/grid/GridProvider';
import Gutters from '@/core/ui/grid/Gutters';
import { theme } from '@/core/ui/themes/default/Theme';
import VisualUpload from '@/core/ui/upload/VisualUpload/VisualUpload';
import { nameOf } from '@/core/utils/nameOf';
import type { ProfileModel } from '@/domain/common/profile/ProfileModel';
import type { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { mapReferenceModelsToUpdateReferenceInputs } from '@/domain/common/reference/ReferenceUtils';
import type { TagsetModel } from '@/domain/common/tagset/TagsetModel';
import { mapTagsetModelsToUpdateTagsetInputs } from '@/domain/common/tagset/TagsetUtils';
import type { VisualModelFull } from '@/domain/common/visual/model/VisualModel';
import { nameSegmentSchema } from '@/domain/platformAdmin/components/Common/NameSegment';
import ProfileReferenceSegment from '@/domain/platformAdmin/components/Common/ProfileReferenceSegment';
import { ProfileSegment, profileSegmentSchema } from '@/domain/platformAdmin/components/Common/ProfileSegment';
import { referenceSegmentValidationObject } from '@/domain/platformAdmin/components/Common/ReferenceSegment';
import { TagsetSegment, tagsetsSegmentSchema } from '@/domain/platformAdmin/components/Common/TagsetSegment';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import type { SpaceBodyOfKnowledgeModel } from '../../virtualContributor/model/SpaceBodyOfKnowledgeModel';

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
  onSave?: (virtualContributor: UpdateVirtualContributorInput) => Promise<unknown>;
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
      displayName: nameSegmentSchema.fields?.displayName ?? displayNameValidator({ required: true }),
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
      <FormikInputField name="hostDisplayName" title="Host" required={true} readOnly={true} disabled={true} />
      <FormikInputField
        name="subSpaceName"
        title={t('virtualContributorSpaceSettings.bodyOfKnowledge')}
        required={true}
        readOnly={true}
        disabled={true}
      />
    </>
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
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
          <Form noValidate={true} onSubmit={handleSubmit}>
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
                    {tagsets?.find(
                      tagset => tagset.name.toLowerCase() === TagsetReservedName.Keywords.toLowerCase()
                    ) ? (
                      <TagsetSegment name={nameOf<VirtualContributorFormValues>('profile.tagsets')} />
                    ) : null}
                    <ProfileReferenceSegment
                      fullWidth={true}
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
  );
};

export default VirtualContributorForm;
