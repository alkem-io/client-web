import { useMemo, PropsWithChildren } from 'react';

import * as yup from 'yup';
import { Formik, FormikConfig } from 'formik';
import { useTranslation } from 'react-i18next';
import { FormControlLabel } from '@mui/material';

import Gutters from '../../../core/ui/grid/Gutters';
import { Caption } from '../../../core/ui/typography';
import FormikSelect from '../../../core/ui/forms/FormikSelect';
import { FormikSwitch } from '../../../core/ui/forms/FormikSwitch';
import FormikEffectFactory from '../../../core/ui/forms/FormikEffect';
import CalloutWhiteboardField, {
  WhiteboardFieldSubmittedValues,
  WhiteboardFieldSubmittedValuesWithPreviewImages,
} from './creationDialog/CalloutWhiteboardField/CalloutWhiteboardField';
import { FormikSelectValue } from '../../../core/ui/forms/FormikAutocomplete';
import { EmptyWhiteboardString } from '../../common/whiteboard/EmptyWhiteboard';
import { TagsetSegment } from '../../platform/admin/components/Common/TagsetSegment';
import MarkdownValidator from '../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import FormikInputField from '../../../core/ui/forms/FormikInputField/FormikInputField';
import FormikMarkdownField from '../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import PostTemplateSelector from '../../templates/components/CalloutForm/PostTemplateSelector';
import { ProfileReferenceSegment } from '../../platform/admin/components/Common/ProfileReferenceSegment';
import WhiteboardTemplateSelector from '../../templates/components/CalloutForm/WhiteboardTemplateSelector';
import ReferenceSegment, { referenceSegmentSchema } from '../../platform/admin/components/Common/ReferenceSegment';

import { gutters } from '../../../core/ui/grid/utils';
import {
  Tagset,
  TagsetType,
  CalloutType,
  CalloutState,
  CalloutGroupName,
} from '../../../core/apollo/generated/graphql-schema';
import { Reference } from '../../common/profile/Profile';
import { JourneyTypeName } from '../../journey/JourneyTypeName';
import { DEFAULT_TAGSET } from '../../common/tags/tagset.constants';
import { JourneyCalloutGroupNameOptions } from './CalloutsInContext/CalloutsGroup';
import { MARKDOWN_TEXT_LENGTH } from '../../../core/ui/forms/field-length.constants';
import { displayNameValidator } from '../../../core/ui/forms/validator/displayNameValidator';

const FormikEffect = FormikEffectFactory<FormValueType>();

const CalloutForm = ({
  children,
  callout,
  calloutType,
  journeyTypeName,
  editMode = false,
  canChangeCalloutLocation,
  onChange,
  onStatusChanged,
}: PropsWithChildren<CalloutFormProps>) => {
  const { t } = useTranslation();

  const tagsets: Tagset[] = useMemo(
    () => [
      {
        id: '-1',
        name: DEFAULT_TAGSET,
        tags: callout?.tags ?? [],
        allowedValues: [],
        type: TagsetType.Freeform,
      },
    ],
    [callout?.id]
  );

  const initialValues: FormValueType = useMemo(
    () => ({
      tagsets,
      type: calloutType,
      references: callout?.references ?? [],
      displayName: callout?.displayName ?? '',
      description: callout?.description ?? '',
      postDescription: callout.postDescription ?? '',
      groupName: callout?.groupName ?? CalloutGroupName.Knowledge,
      opened: (callout?.state ?? CalloutState.Open) === CalloutState.Open,
      whiteboardContent: callout.whiteboardContent ?? EmptyWhiteboardString,
      whiteboard: callout?.whiteboard
        ? {
            ...callout.whiteboard,
            previewImages: undefined,
          }
        : {
            profileData: {
              displayName: t('common.whiteboard'),
            },
            content: EmptyWhiteboardString,
            previewImages: undefined,
          },
    }),
    [callout?.id, tagsets]
  );

  const validationSchema = yup.object().shape({
    displayName: displayNameValidator,
    description: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
    type: yup.string().required(t('common.field-required')),
    opened: yup.boolean().required(),
    whiteboardContent: yup.string().when('type', {
      is: CalloutType.Whiteboard,
      then: yup.string().required(),
    }),
    references: referenceSegmentSchema,
  });

  const handleChange = (values: FormValueType) => {
    const callout: CalloutFormOutput = {
      type: calloutType,
      groupName: values.groupName,
      tags: values.tagsets[0].tags,
      references: values.references,
      whiteboard: values.whiteboard,
      displayName: values.displayName,
      description: values.description,
      postDescription: values.postDescription,
      whiteboardContent: values.whiteboardContent,
      state: values.opened ? CalloutState.Open : CalloutState.Closed,
    };

    onChange?.(callout);
  };

  const calloutsGroups = useMemo<FormikSelectValue[]>(() => {
    const locations = JourneyCalloutGroupNameOptions[journeyTypeName];

    if (editMode) {
      return locations.map(key => ({
        id: key,
        name: t(`callout.callout-group.${key}` as const),
      }));
    }

    return [];
  }, [editMode]);

  // Enable or disable form fields depending on the callout type and other conditions
  const formConfiguration = {
    tags: true,
    whiteboard: calloutType === CalloutType.Whiteboard,
    newResponses: calloutType !== CalloutType.Whiteboard,
    references: calloutType !== CalloutType.LinkCollection,
    postTemplate: calloutType === CalloutType.PostCollection,
    linkCollectionAdd: calloutType === CalloutType.LinkCollection,
    locationChange: editMode && Boolean(canChangeCalloutLocation),
    whiteboardTemplate: calloutType === CalloutType.WhiteboardCollection,
  };

  return (
    <Formik
      validateOnMount
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      initialTouched={{
        displayName: initialValues.displayName !== '',
      }}
      onSubmit={() => {}}
    >
      {formikState => (
        <>
          <Gutters>
            <FormikEffect onChange={handleChange} onStatusChange={onStatusChanged} />

            <FormikInputField name="displayName" title={t('common.title')} placeholder={t('common.title')} />

            {!editMode && formConfiguration.whiteboard && <CalloutWhiteboardField name="whiteboard" />}

            <FormikMarkdownField
              rows={7}
              name="description"
              maxLength={MARKDOWN_TEXT_LENGTH}
              title={t('components.callout-creation.info-step.description')}
            />

            {editMode && formConfiguration.references && (
              <ProfileReferenceSegment
                compactMode
                marginTop={gutters(-1)}
                profileId={callout?.profileId}
                references={formikState.values.references}
              />
            )}

            {!editMode && formConfiguration.references && (
              <ReferenceSegment compactMode references={formikState.values.references} marginTop={gutters(-1)} />
            )}

            {formConfiguration.tags && (
              <TagsetSegment
                tagsets={tagsets}
                title={t('common.tags')}
                helpText={t('components.post-creation.info-step.tags-help-text')}
              />
            )}

            {!editMode && formConfiguration.linkCollectionAdd && (
              <Caption>{t('callout.link-collection.save-to-add')}</Caption>
            )}

            {formConfiguration.postTemplate && <PostTemplateSelector name="postDescription" />}

            {formConfiguration.whiteboardTemplate && <WhiteboardTemplateSelector name="whiteboardContent" />}

            {formConfiguration.newResponses && <FormikSwitch name="opened" title={t('callout.state-permission')} />}

            {formConfiguration.locationChange && journeyTypeName === 'space' && (
              <FormControlLabel
                labelPlacement="start"
                label={t('callout.callout-location')}
                control={<FormikSelect name="groupName" values={calloutsGroups} />}
                sx={{ margin: 0, '& > span': { marginRight: theme => theme.spacing(2) } }}
              />
            )}
          </Gutters>

          {typeof children === 'function' ? (children as Function)(formikState) : children}
        </>
      )}
    </Formik>
  );
};

export default CalloutForm;

type FormValueType = {
  opened: boolean;
  type: CalloutType;
  tagsets: Tagset[];
  displayName: string;
  description: string;
  references: Reference[];
  postDescription?: string;
  whiteboardContent?: string;
  groupName: CalloutGroupName;
  whiteboard?: WhiteboardFieldSubmittedValuesWithPreviewImages;
};

export type CalloutFormInput = {
  id?: string;
  tags?: string[];
  profileId?: string;
  type?: CalloutType;
  displayName?: string;
  description?: string;
  state?: CalloutState;
  postDescription?: string;
  references?: Reference[];
  whiteboardContent?: string;
  groupName?: CalloutGroupName;
  whiteboard?: WhiteboardFieldSubmittedValues;
};

export type CalloutFormOutput = {
  tags: string[];
  type: CalloutType;
  displayName: string;
  description: string;
  state: CalloutState;
  references: Reference[];
  postDescription?: string;
  whiteboardContent?: string;
  groupName: CalloutGroupName;
  whiteboard?: WhiteboardFieldSubmittedValuesWithPreviewImages;
};

export interface CalloutFormProps {
  calloutType: CalloutType;
  callout: CalloutFormInput;
  journeyTypeName: JourneyTypeName;
  editMode?: boolean;
  canChangeCalloutLocation?: boolean;
  children?: FormikConfig<FormValueType>['children'];
  onStatusChanged?: (isValid: boolean) => void;
  onChange?: (callout: CalloutFormOutput) => void;
}
