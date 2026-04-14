import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalloutFramingType,
  CalloutVisibility,
  PollResultsDetail,
  PollResultsVisibility,
} from '@/core/apollo/generated/graphql-schema';
import { AddPostModal } from '@/crd/forms/callout/AddPostModal';
import { CalloutContributionSettings } from '@/crd/forms/callout/CalloutContributionSettings';
import { CalloutVisibilitySelector } from '@/crd/forms/callout/CalloutVisibilitySelector';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import type { CalloutCreationType } from '@/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreation';
import { useCalloutCreation } from '@/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreation';
import { useCrdCalloutForm } from '../hooks/useCrdCalloutForm';
import { FramingEditorConnector } from './FramingEditorConnector';

type CalloutFormConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calloutsSetId?: string;
  onFindTemplate?: () => void;
};

const ATTACHMENT_TO_FRAMING_TYPE: Record<string, CalloutFramingType> = {
  none: CalloutFramingType.None,
  whiteboard: CalloutFramingType.Whiteboard,
  memo: CalloutFramingType.Memo,
  cta: CalloutFramingType.Link,
  image: CalloutFramingType.MediaGallery,
  poll: CalloutFramingType.Poll,
};

export function CalloutFormConnector({ open, onOpenChange, calloutsSetId, onFindTemplate }: CalloutFormConnectorProps) {
  const { t } = useTranslation('crd-space');
  const { values, errors, setField, validate, reset } = useCrdCalloutForm();
  const [activeAttachment, setActiveAttachment] = useState('none');

  const { handleCreateCallout, loading } = useCalloutCreation({ calloutsSetId });

  const mapFormToCallout = (visibility: CalloutVisibility): CalloutCreationType => {
    const framingType = ATTACHMENT_TO_FRAMING_TYPE[activeAttachment] ?? CalloutFramingType.None;

    const callout: CalloutCreationType = {
      framing: {
        type: framingType,
        profile: {
          displayName: values.title.trim(),
          description: values.description || undefined,
        },
        tags: values.tags
          ? values.tags
              .split(',')
              .map(tag => tag.trim())
              .filter(Boolean)
          : undefined,
      },
      settings: {
        visibility,
        framing: {
          commentsEnabled: values.commentsEnabled,
        },
      },
      sendNotification: values.notifyMembers && visibility === CalloutVisibility.Published,
    };

    // Poll framing
    if (framingType === CalloutFramingType.Poll && values.pollQuestion) {
      callout.framing.poll = {
        title: values.pollQuestion,
        options: values.pollOptions.filter(o => o.text.trim()).map(o => o.text.trim()),
        settings: {
          allowContributorsAddOptions: values.pollAllowCustomOptions,
          minResponses: 1,
          maxResponses: values.pollAllowMultiple ? 0 : 1,
          resultsVisibility: values.pollHideResultsUntilVoted
            ? PollResultsVisibility.Hidden
            : PollResultsVisibility.Visible,
          resultsDetail: values.pollShowVoterAvatars ? PollResultsDetail.Full : PollResultsDetail.Count,
        },
      };
    }

    // Link framing
    if (framingType === CalloutFramingType.Link && values.linkUrl) {
      callout.framing.profile.referencesData = [
        {
          uri: values.linkUrl.trim(),
          name: values.linkDisplayName.trim() || values.linkUrl.trim(),
        },
      ];
    }

    return callout;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const callout = mapFormToCallout(CalloutVisibility.Published);
    await handleCreateCallout(callout);
    reset();
    onOpenChange(false);
  };

  const handleSaveDraft = async () => {
    if (!validate()) return;
    const callout = mapFormToCallout(CalloutVisibility.Draft);
    await handleCreateCallout(callout);
    reset();
    onOpenChange(false);
  };

  return (
    <AddPostModal
      open={open}
      onOpenChange={onOpenChange}
      title={{
        value: values.title,
        onChange: v => setField('title', v),
        error: errors.title,
      }}
      descriptionSlot={
        <MarkdownEditor
          value={values.description}
          onChange={v => setField('description', v)}
          placeholder={t('forms.descriptionPlaceholder')}
        />
      }
      tags={{
        value: values.tags,
        onChange: v => setField('tags', v),
      }}
      framingEditorSlot={
        <FramingEditorConnector
          framingType={activeAttachment}
          linkUrl={values.linkUrl}
          onLinkUrlChange={v => setField('linkUrl', v)}
          linkUrlError={errors.linkUrl}
          linkDisplayName={values.linkDisplayName}
          onLinkDisplayNameChange={v => setField('linkDisplayName', v)}
          linkDisplayNameError={errors.linkDisplayName}
          pollQuestion={values.pollQuestion}
          onPollQuestionChange={v => setField('pollQuestion', v)}
          pollQuestionError={errors.pollQuestion}
          pollOptions={values.pollOptions}
          onPollOptionsChange={v => setField('pollOptions', v)}
          pollAllowMultiple={values.pollAllowMultiple}
          onPollAllowMultipleChange={v => setField('pollAllowMultiple', v)}
          pollAllowCustomOptions={values.pollAllowCustomOptions}
          onPollAllowCustomOptionsChange={v => setField('pollAllowCustomOptions', v)}
          pollHideResultsUntilVoted={values.pollHideResultsUntilVoted}
          onPollHideResultsUntilVotedChange={v => setField('pollHideResultsUntilVoted', v)}
          pollShowVoterAvatars={values.pollShowVoterAvatars}
          onPollShowVoterAvatarsChange={v => setField('pollShowVoterAvatars', v)}
        />
      }
      activeAttachment={activeAttachment}
      onAttachmentChange={setActiveAttachment}
      settingsSlot={
        <>
          <CalloutContributionSettings
            allowedTypes={values.allowedContributionTypes}
            onAllowedTypesChange={types => setField('allowedContributionTypes', types)}
            commentsEnabled={values.commentsEnabled}
            onCommentsEnabledChange={v => setField('commentsEnabled', v)}
          />
          <CalloutVisibilitySelector
            value={values.visibility}
            onChange={v => setField('visibility', v)}
            notifyMembers={values.notifyMembers}
            onNotifyMembersChange={v => setField('notifyMembers', v)}
          />
        </>
      }
      onSubmit={handleSubmit}
      onSaveDraft={handleSaveDraft}
      onFindTemplate={onFindTemplate}
      loading={loading}
    />
  );
}
