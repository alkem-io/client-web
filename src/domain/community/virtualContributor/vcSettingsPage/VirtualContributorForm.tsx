import { Form, Formik } from 'formik';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Box, Button, Theme, useMediaQuery } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Tagset, UpdateVirtualContributorInput, Visual } from '../../../../core/apollo/generated/graphql-schema';
import useNavigate from '../../../../core/routing/useNavigate';
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
import { BokProps } from '../vcProfilePage/SpaceHorizontalCard';

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

interface Props extends BokProps {
  virtualContributor: VirtualContributorProps;
  avatar: Visual | undefined;
  onSave?: (virtualContributor: UpdateVirtualContributorInput) => void;
  title?: string;
}

export const VirtualContributorForm: FC<Props> = ({
  virtualContributor: currentVirtualContributor,
  bokProfile,
  avatar,
  onSave,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleBack = () => navigate(-1);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

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

  const backButton = (
    <Button onClick={handleBack} variant="text">
      {t('buttons.back')}
    </Button>
  );

  const HostFields = () => (
    <>
      <FormikInputField name="hostDisplayName" title="Host" required readOnly disabled />
      <FormikInputField name="subSpaceName" title="Body Of Knowledge Subspace" required readOnly disabled />
    </>
  );

  if (!currentVirtualContributor) {
    return (
      <>
        <div>Virtual Contributor not found!</div>
        {backButton}
      </>
    );
  } else {
    return (
      <>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({ values: { avatar, tagsets }, handleSubmit }) => {
            return (
              <Form noValidate onSubmit={handleSubmit}>
                <GridContainer>
                  <GridProvider columns={12}>
                    <GridItem columns={isMobile ? 6 : 2}>
                      {avatar && (
                        <Box display="flex" justifyContent="center">
                          <VisualUpload
                            visual={avatar}
                            altText={t('visuals-alt-text.avatar.contributor.text', {
                              displayName,
                              altText: avatar?.alternativeText,
                            })}
                          />
                        </Box>
                      )}
                    </GridItem>
                    <GridItem columns={isMobile ? 6 : 8}>
                      <Gutters>
                        <>
                          <NameSegment disabled required />
                          <ProfileSegment />
                          {tagsets && <TagsetSegment tagsets={tagsets} />}
                          <HostFields />
                          <Actions marginTop={theme.spacing(2)} sx={{ justifyContent: 'end' }}>
                            {backButton}
                            <LoadingButton loading={loading} type="submit" variant="contained">
                              {t('buttons.save')}
                            </LoadingButton>
                          </Actions>
                        </>
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
  }
};

export default VirtualContributorForm;
