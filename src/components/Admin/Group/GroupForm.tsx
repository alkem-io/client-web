import { Formik } from 'formik';
import React, { FC, useMemo } from 'react';
import { Col, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router-dom';
import * as yup from 'yup';
import { useTagsetsTemplateQuery } from '../../../hooks/generated/graphql';
import { GroupFormGenerated } from '../../../models/Group';
import { Tagset as TagsetModel } from '../../../models/Profile';
import { Reference, Tagset, TagsetTemplate, User, UserGroup } from '../../../models/graphql-schema';
import Button from '../../core/Button';
import Section, { Header } from '../../core/Section';
import EditableAvatar from '../../EditableAvatar';
import { FormikInputField } from '../Common/FormikInputField';
import ProfileReferenceSegment from '../Common/ProfileReferenceSegment';
import { referenceSegmentSchema } from '../Common/ReferenceSegment';
import { tagsetSegmentSchema, TagsetSegment } from '../Common/TagsetSegment';
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
              avatar={
                <EditableAvatar src={avatar} size={'xl'} className={'mb-2'} name={'Avatar'} profileId={profileId} />
              }
              details={<GroupMembersDetails members={members || []} editLink={`${url}/members`} />}
            >
              <Header text={title} />
              <Form.Row>
                <Form.Group as={Col}>
                  <FormikInputField
                    name={'name'}
                    title={'Name'}
                    value={name}
                    required={!isReadOnlyMode}
                    readOnly={isReadOnlyMode}
                    placeholder={'Full Name'}
                    disabled={isSubmitting}
                  />
                </Form.Group>
              </Form.Row>
              <Form.Row>
                <Form.Group as={Col}>
                  <FormikInputField
                    name={'description'}
                    title={'Description'}
                    value={description}
                    readOnly={isReadOnlyMode}
                    placeholder={'Description'}
                    multiline
                    disabled={isSubmitting}
                  />
                </Form.Group>
              </Form.Row>

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
                <div className={'d-flex mt-4'}>
                  <div className={'flex-grow-1'} />
                  {onCancel && (
                    <Button
                      variant={isEditMode ? 'default' : 'primary'}
                      onClick={() => onCancel()}
                      disabled={isSubmitting}
                      className={'ml-3'}
                      text={t(`buttons.${isEditMode ? 'cancel' : 'back'}`)}
                    />
                  )}
                  {onDelete && (
                    <Button
                      variant={'negative'}
                      onClick={() => onDelete(groupId)}
                      disabled={isSubmitting}
                      className={'ml-3'}
                      text={t('buttons.delete')}
                    />
                  )}
                  <Button
                    variant={'primary'}
                    type={'submit'}
                    className={'ml-3'}
                    disabled={isSubmitting}
                    text={t('buttons.save')}
                  />
                </div>
              )}
            </Section>
          </Form>
        );
      }}
    </Formik>
  );
};
export default GroupForm;
