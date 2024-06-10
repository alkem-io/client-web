import { Form, Formik } from 'formik';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Box, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Tagset, UpdateVirtualContributorInput, Visual } from '../../../../core/apollo/generated/graphql-schema';
import { NameSegment, nameSegmentSchema } from '../../../platform/admin/components/Common/NameSegment';
import { ProfileSegment, profileSegmentSchema } from '../../../platform/admin/components/Common/ProfileSegment';
import VisualUpload from '../../../../core/ui/upload/VisualUpload/VisualUpload';
import Gutters from '../../../../core/ui/grid/Gutters';
import useLoadingState from '../../../shared/utils/useLoadingState';
import { Actions } from '../../../../core/ui/actions/Actions';
import { TagsetSegment } from '../../../platform/admin/components/Common/TagsetSegment';
import { UpdateTagset } from '../../../common/profile/Profile';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { theme } from '../../../../core/ui/themes/default/Theme';
import GridContainer from '../../../../core/ui/grid/GridContainer';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import GridItem from '../../../../core/ui/grid/GridItem';
import { BasicSpaceProps } from '../components/BasicSpaceCard';
import { useColumns } from '../../../../core/ui/grid/GridContext';
import { useBackToStaticPath } from '../../../../core/routing/useBackToPath';

interface VirtualContributorProps {
  id: string;
  nameID: string;
  account?: {
    host?: {
      profile: {
        displayName: string;
      };
    };
  };
  profile: {
    id: string;
    displayName: string;
    description?: string;
    tagline: string;
    tagsets?: Tagset[] | undefined;
    url: string;
    avatar?: Visual | undefined;
  };
}

interface VirtualContributorFromProps {
  name: string;
  nameID: string;
  description: string;
  tagline: string;
  tagsets?: Tagset[];
  avatar: Visual | undefined;
  hostDisplayName: string;
  subSpaceName: string;
}

interface Props {
  virtualContributor: VirtualContributorProps;
  bokProfile?: BasicSpaceProps;
  avatar: Visual | undefined;
  onSave?: (virtualContributor: UpdateVirtualContributorInput) => void;
  hasBackNavitagion?: boolean;
}

export const VirtualContributorForm: FC<Props> = ({
  virtualContributor: currentVirtualContributor,
  bokProfile,
  avatar,
  onSave,
  hasBackNavitagion = true,
}) => {
  const { t } = useTranslation();
  const handleBack = useBackToStaticPath(currentVirtualContributor.profile.url);
  const cols = useColumns();
  const isMobile = cols < 5;

  const {
    nameID,
    profile: { displayName, description, tagline, tagsets },
    account,
  } = currentVirtualContributor;
  const { displayName: subSpaceName } = bokProfile ?? {};

  const initialValues: VirtualContributorFromProps = {
    name: displayName,
    nameID: nameID,
    description: description ?? '',
    tagline: tagline,
    avatar: avatar,
    tagsets: tagsets,
    hostDisplayName: account?.host?.profile.displayName ?? '',
    subSpaceName: subSpaceName ?? '',
  };

  const validationSchema = yup.object().shape({
    name: nameSegmentSchema.fields?.name ?? yup.string(),
    nameID: nameSegmentSchema.fields?.nameID ?? yup.string(),
    description: profileSegmentSchema.fields?.description ?? yup.string(),
  });

  const getUpdatedTagsets = (updatedTagsets: Tagset[]) => {
    const result: UpdateTagset[] = [];
    updatedTagsets.forEach(updatedTagset => {
      const originalTagset = tagsets?.find(value => value.name === updatedTagset.name);
      if (originalTagset) {
        result.push({ ...originalTagset, tags: updatedTagset.tags });
      }
    });

    return result;
  };

  const [handleSubmit, loading] = useLoadingState(async (values: VirtualContributorFromProps) => {
    const { tagsets, description, tagline, name, ...otherData } = values;
    const updatedTagsets = getUpdatedTagsets(tagsets ?? []);

    const virtualContributor = {
      ID: currentVirtualContributor.id,
      profileData: {
        displayName: name,
        description,
        tagline,
        tagsets: updatedTagsets.map(r => ({
          ID: r.id,
          tags: r.tags ?? [],
        })),
      },
      ...otherData,
    };

    await onSave?.(virtualContributor);
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
        {({ values: { avatar, tagsets, hostDisplayName }, handleSubmit }) => {
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
                      <NameSegment disabled required />
                      <ProfileSegment />
                      {tagsets && <TagsetSegment tagsets={tagsets} />}
                      {hostDisplayName && <HostFields />}
                      <Actions marginTop={theme.spacing(2)} sx={{ justifyContent: 'end' }}>
                        {hasBackNavitagion && (
                          <Button onClick={handleBack} variant="text">
                            {t('buttons.back')}
                          </Button>
                        )}
                        <LoadingButton loading={loading} type="submit" variant="contained">
                          {t('buttons.save')}
                        </LoadingButton>
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
