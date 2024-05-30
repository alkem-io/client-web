import { Form, Formik } from 'formik';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Tagset, UpdateVirtualContributorInput, Visual } from '../../../../core/apollo/generated/graphql-schema';
import useNavigate from '../../../../core/routing/useNavigate';
import { NameSegment, nameSegmentSchema } from '../../../platform/admin/components/Common/NameSegment';
import { ProfileSegment, profileSegmentSchema } from '../../../platform/admin/components/Common/ProfileSegment';
import { Button, Grid } from '@mui/material';
import WrapperButton from '../../../../core/ui/button/deprecated/WrapperButton';
import VisualUpload from '../../../../core/ui/upload/VisualUpload/VisualUpload';
import Section, { Header } from '../../../../core/ui/content/deprecated/Section';
import Gutters from '../../../../core/ui/grid/Gutters';
import useLoadingState from '../../../shared/utils/useLoadingState';
import { Actions } from '../../../../core/ui/actions/Actions';
import { LoadingButton } from '@mui/lab';
import { TagsetSegment } from '../../../platform/admin/components/Common/TagsetSegment';
import { UpdateTagset } from '../../../common/profile/Profile';

interface VirtualContributorProps {
  id: string;
  nameID: string;
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
}

interface Props {
  virtualContributor: VirtualContributorProps;
  avatar: Visual | undefined;
  onSave?: (virtualContributor: UpdateVirtualContributorInput) => void;
  title?: string;
}

export const VirtualContributorForm: FC<Props> = ({
  virtualContributor: currentVirtualContributor,
  avatar,
  onSave,
  title = 'Virtual Contributor',
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    nameID,
    profile: { displayName, description, tagline, tagsets },
  } = currentVirtualContributor;

  const initialValues: VirtualContributorFromProps = {
    name: displayName,
    nameID: nameID,
    description: description ?? '',
    tagline: tagline,
    avatar: avatar,
    tagsets: tagsets,
  };

  const validationSchema = yup.object().shape({
    name: nameSegmentSchema.fields?.name || yup.string(),
    nameID: nameSegmentSchema.fields?.nameID || yup.string(),
    description: profileSegmentSchema.fields?.description || yup.string(),
  });

  const getUpdatedTagsets = (updatedTagsets: Tagset[]) => {
    const result: UpdateTagset[] = [];
    updatedTagsets.forEach(updatedTagset => {
      const originalTagset = tagsets?.find(value => value.name === updatedTagset.name);
      if (originalTagset) result.push({ ...originalTagset, tags: updatedTagset.tags });
    });

    return result;
  };

  const [handleSubmit, loading] = useLoadingState(async (values: VirtualContributorFromProps) => {
    const { tagsets, description, tagline, name, ...otherData } = values;
    const updatedTagsets = getUpdatedTagsets(tagsets || []);

    const virtualContributor = {
      ID: currentVirtualContributor.id,
      profileData: {
        displayName: name,
        description,
        tagline,
        tagsets: updatedTagsets.map(r => ({
          ID: r.id,
          id: undefined,
          tags: r.tags ?? [],
        })),
      },
      ...otherData,
    };

    await onSave?.(virtualContributor);
  });

  const handleBack = () => navigate(-1);

  const backButton = (
    <Grid item>
      <WrapperButton variant="default" onClick={handleBack} text={t('buttons.back')} />
    </Grid>
  );

  const getVisualAvatar = avatar => {
    if (avatar) {
      return (
        <VisualUpload
          visual={avatar}
          altText={t('visuals-alt-text.avatar.contributor.text', {
            displayName,
            altText: avatar?.alternativeText,
          })}
        />
      );
    }
    return null;
  };

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
                <Section avatar={getVisualAvatar(avatar)}>
                  <Header text={title} />
                  <Gutters disablePadding>
                    <>
                      <NameSegment disabled required />
                      <ProfileSegment />
                      {tagsets && <TagsetSegment tagsets={tagsets} />}
                    </>
                  </Gutters>
                  <Actions>
                    <Button onClick={handleBack} variant="text">
                      {t('buttons.back')}
                    </Button>
                    <LoadingButton loading={loading} type="submit" variant="contained">
                      {t('buttons.save')}
                    </LoadingButton>
                  </Actions>
                </Section>
              </Form>
            );
          }}
        </Formik>
      </>
    );
  }
};

export default VirtualContributorForm;
