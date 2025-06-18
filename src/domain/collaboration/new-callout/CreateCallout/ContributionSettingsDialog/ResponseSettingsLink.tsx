import React, { forwardRef, useImperativeHandle } from 'react';
import { ContributionTypeSettingsComponentRef } from './CalloutFormResponseSettingsDialog';

const ResponseSettingsLink = forwardRef<ContributionTypeSettingsComponentRef>((props, ref) => {
  useImperativeHandle(ref, () => ({
    onSave: () => {
      // Custom save logic here
      console.log('ResponseSettingsLink onSave called!');
    },
  }));

  return (
    <div>
      <p>Links...</p>
    </div>
  );
});

export default ResponseSettingsLink;
