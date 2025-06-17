import React, { forwardRef, useImperativeHandle } from 'react';
import { ResponseSettingsComponentRef } from './CalloutFormResponseSettingsDialog';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';

const ResponseSettingsPost = forwardRef<ResponseSettingsComponentRef>((props, ref) => {
  useImperativeHandle(ref, () => ({
    onSave: () => {
      // Custom save logic here
      console.log('ResponseSettingsPost onSave called!');
    },
  }));

  return <FormikMarkdownField title="Default Description" name="framing.profile.description" />;
});

export default ResponseSettingsPost;
