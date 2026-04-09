import { useState } from 'react';
import { AddPostModal } from '@/crd/forms/callout/AddPostModal';
import { CalloutContributionSettings } from '@/crd/forms/callout/CalloutContributionSettings';
import { CalloutVisibilitySelector } from '@/crd/forms/callout/CalloutVisibilitySelector';
import { useCrdCalloutForm } from '../hooks/useCrdCalloutForm';
import { FramingEditorConnector } from './FramingEditorConnector';

type CalloutFormConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: Record<string, unknown>) => void;
  onFindTemplate?: () => void;
};

export function CalloutFormConnector({ open, onOpenChange, onSubmit, onFindTemplate }: CalloutFormConnectorProps) {
  const { values, errors, setField, validate, reset } = useCrdCalloutForm();
  const [activeAttachment, setActiveAttachment] = useState('none');

  const handleSubmit = () => {
    if (validate()) {
      onSubmit?.({ ...values, visibility: 'published' });
      reset();
      onOpenChange(false);
    }
  };

  const handleSaveDraft = () => {
    if (validate()) {
      onSubmit?.({ ...values, visibility: 'draft' });
      reset();
      onOpenChange(false);
    }
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
    />
  );
}
