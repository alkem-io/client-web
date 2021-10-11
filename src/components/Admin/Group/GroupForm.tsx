import { Form, Formik } from 'formik';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router-dom';
import * as yup from 'yup';
import { useTagsetsTemplateQuery } from '../../../hooks/generated/graphql';
import { GroupFormGenerated } from '../../../models/Group';
import { Tagset as TagsetModel } from '../../../models/Profile';
import { Reference, Tagset, TagsetTemplate, User, UserGroup } from '../../../models/graphql-schema';
import Button from '../../core/Button';
import Section, { Header } from '../../core/Section';
import EditableAvatar from '../../composite/common/EditableAvatar';

import ProfileReferenceSegment from '../Common/ProfileReferenceSegment';
import { referenceSegmentSchema } from '../Common/ReferenceSegment';
import { tagsetSegmentSchema, TagsetSegment } from '../Common/TagsetSegment';
import GroupMembersDetails from './GroupMembersDetails';
import { Grid } from '@material-ui/core';
import FormikInputField from '../../composite/forms/FormikInputField';

interface GroupFormProps {
  title?: string;
  members?: User[];
  group: UserGroup;
  onSave?: (group: UserGroup) => Promise<void>;
  onCancel?: () => void;
  onDelete?: (groupId: string) => void;
}

export const GroupForm: FC<GroupFormProps> = ({ title, group, members, onSave, onCancel, onDelete }) => {
  const { url } = useRouteMatch();
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
    avatar: group.profile?.avatar || '',
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
    const { tagsets, avatar, references, description, profileId, ...otherData } = formData;
    const group: UserGroup = {
      ...otherData,
      id: groupId,
      profile: {
        id: profileId,
        description,
        avatar,
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
      {({ values: { name, references, tagsets, avatar, description }, handleSubmit, isSubmitting }) => {
        return (
          <Form noValidate onSubmit={handleSubmit}>
            <Section
              avatar={<EditableAvatar src={avatar} size={'xl'} name={'Avatar'} profileId={profileId} />}
              details={<GroupMembersDetails members={members || []} editLink={`${url}/members`} />}
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
                        <Button
                          variant={isEditMode ? 'default' : 'primary'}
                          onClick={() => onCancel()}
                          disabled={isSubmitting}
                          text={t(`buttons.${isEditMode ? 'cancel' : 'back'}` as const)}
                        />
                      </Grid>
                    )}
                    {onDelete && (
                      <Grid item>
                        <Button
                          variant={'negative'}
                          onClick={() => onDelete(groupId)}
                          disabled={isSubmitting}
                          text={t('buttons.delete')}
                        />
                      </Grid>
                    )}
                    <Grid item>
                      <Button variant={'primary'} type={'submit'} disabled={isSubmitting} text={t('buttons.save')} />
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
