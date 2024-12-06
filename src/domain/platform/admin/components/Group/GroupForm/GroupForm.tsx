import {
  GroupInfoFragment,
  Profile,
  Reference,
  StorageBucket,
  Tagset,
  User,
} from '@/core/apollo/generated/graphql-schema';
import NegativeButton from '@/core/ui/button/NegativeButton';
import Section, { Header } from '@/core/ui/content/deprecated/Section';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import VisualUpload from '@/core/ui/upload/VisualUpload/VisualUpload';
import ProfileReferenceSegment from '@/domain/platform/admin/components/Common/ProfileReferenceSegment';
import { referenceSegmentSchema } from '@/domain/platform/admin/components/Common/ReferenceSegment';
import { TagsetSegment, tagsetsSegmentSchema } from '@/domain/platform/admin/components/Common/TagsetSegment';
import { Button, Grid } from '@mui/material';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import GroupMembersDetails from '../GroupMembersDetails';
import { GroupFormInput } from './GroupFormInput';

type GroupFormProps = {
  title?: string;
  members?: User[];
  group: GroupInfoFragment;
  onSave?: (group: UserGroupUpdateInput) => Promise<void>;
  onCancel?: () => void;
  onDelete?: (groupId: string) => void;
};

export interface UserGroupUpdateInput {
  id: string;
  profile: Omit<Profile, 'url'>;
}

export const GroupForm = ({ title, group, members, onSave, onCancel, onDelete }: GroupFormProps) => {
  const isReadOnlyMode = false;
  const isEditMode = true;
  const { t } = useTranslation();
  const groupId = group.id;
  const profileId = group.profile?.id || '';
  const groupName = group.profile?.displayName || '';

  const initialValues: GroupFormInput = {
    name: groupName || '',
    tagsets: [],
    references: group.profile?.references || [],
    description: group.profile?.description || '',
    profileId: group.profile?.id || '',
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required(t('forms.validations.required')),
    avatar: yup.string(),
    tagsets: tagsetsSegmentSchema,
    references: referenceSegmentSchema,
    description: yup.string().max(400),
  });

  const handleSubmit = async (formData: GroupFormInput) => {
    const { tagsets, references, description, profileId, name } = formData;
    const group: UserGroupUpdateInput = {
      id: groupId,
      profile: {
        id: profileId,
        displayName: name,
        description,
        references: references as Reference[],
        tagsets: tagsets as Tagset[],
        tagline: '',
        visuals: [],
        storageBucket: {} as StorageBucket,
      },
    };
    onSave && (await onSave(group));
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={(values, { setSubmitting }) => handleSubmit(values).finally(() => setSubmitting(false))}
    >
      {({ values: { name, references, tagsets, description }, handleSubmit, isSubmitting }) => {
        return (
          <Form noValidate onSubmit={handleSubmit}>
            <Section
              avatar={<VisualUpload visual={group?.profile?.visual} />}
              details={<GroupMembersDetails members={members || []} editLink />}
            >
              <Header text={title} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormikInputField
                    name={'name'}
                    title={'Name'}
                    value={name}
                    required={!isReadOnlyMode}
                    readOnly={isReadOnlyMode}
                    placeholder={'Full Name'}
                    disabled={isSubmitting}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormikInputField
                    name={'description'}
                    title={'Description'}
                    value={description}
                    readOnly={isReadOnlyMode}
                    placeholder={'Description'}
                    multiline
                    disabled={isSubmitting}
                  />
                </Grid>

                <TagsetSegment tagsets={tagsets} readOnly={isReadOnlyMode} disabled={isSubmitting} />
                {isEditMode && (
                  <ProfileReferenceSegment
                    references={references}
                    readOnly={isReadOnlyMode}
                    disabled={isSubmitting}
                    profileId={profileId}
                  />
                )}

                {isEditMode && (
                  <Grid container item justifyContent={'flex-end'} spacing={2}>
                    {onCancel && (
                      <Grid item>
                        <Button onClick={onCancel} disabled={isSubmitting} variant="outlined">
                          {t(`buttons.${isEditMode ? 'cancel' : 'back'}`)}
                        </Button>
                      </Grid>
                    )}
                    {onDelete && (
                      <Grid item>
                        <NegativeButton onClick={() => onDelete(groupId)} disabled={isSubmitting}>
                          {t('buttons.delete')}
                        </NegativeButton>
                      </Grid>
                    )}
                    <Grid item>
                      <Button variant="outlined" type="submit" disabled={isSubmitting}>
                        {t('buttons.save')}
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Section>
          </Form>
        );
      }}
    </Formik>
  );
};

export default GroupForm;
