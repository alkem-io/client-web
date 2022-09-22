import { Grid } from '@mui/material';
import { Form, Formik } from 'formik';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {} from 'react-router-dom';
import * as yup from 'yup';
import { useTagsetsTemplateQuery } from '../../../../../hooks/generated/graphql';
import { Reference, Tagset, TagsetTemplate, User, UserGroup } from '../../../../../models/graphql-schema';
import { GroupFormGenerated } from '../../../../../models/Group';
import { Tagset as TagsetModel } from '../../../../../models/Profile';
import FormikInputField from '../../../../../common/components/composite/forms/FormikInputField';
import WrapperButton from '../../../../../common/components/core/WrapperButton';
import Section, { Header } from '../../../../../common/components/core/Section';
import VisualUpload from '../../../../../common/components/composite/common/VisualUpload/VisualUpload';
import ProfileReferenceSegment from '../Common/ProfileReferenceSegment';
import { referenceSegmentSchema } from '../Common/ReferenceSegment';
import { TagsetSegment, tagsetSegmentSchema } from '../Common/TagsetSegment';
import GroupMembersDetails from './GroupMembersDetails';

interface GroupFormProps {
  title?: string;
  members?: User[];
  group: UserGroup;
  onSave?: (group: UserGroup) => Promise<void>;
  onCancel?: () => void;
  onDelete?: (groupId: string) => void;
}

export const GroupForm: FC<GroupFormProps> = ({ title, group, members, onSave, onCancel, onDelete }) => {
  const isReadOnlyMode = false;
  const isEditMode = true;
  const { t } = useTranslation();
  const groupId = group.id;
  const profileId = group.profile?.id || '';
  const groupName = group.name || '';
  const { data: config } = useTagsetsTemplateQuery();

  const tagsetsTemplate: TagsetTemplate[] = useMemo(() => {
    if (config) return config.configuration.template.users[0].tagsets || [];
    return [];
  }, [config]);

  const tagsets = useMemo(() => {
    let tagsets = group.profile?.tagsets || [];
    return tagsetsTemplate.reduce(
      (acc, cur) => {
        if (acc.every(x => x.name.toLowerCase() !== cur.name.toLowerCase())) {
          acc.push({ name: cur.name, tags: [] });
        }
        return acc;
      },
      [...(tagsets as TagsetModel[])]
    );
  }, [group, tagsetsTemplate]);

  const initialValues: GroupFormGenerated = {
    name: groupName || '',
    tagsets: tagsets,
    references: group.profile?.references || [],
    description: group.profile?.description || '',
    profileId: group.profile?.id || '',
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required(t('forms.validations.required')),
    avatar: yup.string(),
    tagsets: tagsetSegmentSchema,
    references: referenceSegmentSchema,
    description: yup.string().max(400),
  });

  const handleSubmit = async (formData: GroupFormGenerated) => {
    const { tagsets, references, description, profileId, ...otherData } = formData;
    const group: UserGroup = {
      ...otherData,
      id: groupId,
      profile: {
        id: profileId,
        description,
        references: references as Reference[],
        tagsets: tagsets as Tagset[],
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
              avatar={<VisualUpload visual={group?.profile?.avatar} />}
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

                <TagsetSegment
                  tagsets={tagsets}
                  template={tagsetsTemplate}
                  readOnly={isReadOnlyMode}
                  disabled={isSubmitting}
                />
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
                        <WrapperButton
                          variant={isEditMode ? 'default' : 'primary'}
                          onClick={() => onCancel()}
                          disabled={isSubmitting}
                          text={t(`buttons.${isEditMode ? 'cancel' : 'back'}` as const)}
                        />
                      </Grid>
                    )}
                    {onDelete && (
                      <Grid item>
                        <WrapperButton
                          variant={'negative'}
                          onClick={() => onDelete(groupId)}
                          disabled={isSubmitting}
                          text={t('buttons.delete')}
                        />
                      </Grid>
                    )}
                    <Grid item>
                      <WrapperButton variant={'primary'} type={'submit'} disabled={isSubmitting} text={t('buttons.save')} />
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
