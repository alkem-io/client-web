import React, { forwardRef, useImperativeHandle } from 'react';
import { ContributionTypeSettingsComponentRef } from './CalloutFormResponseSettingsDialog';

const ResponseSettingsWhiteboard = forwardRef<ContributionTypeSettingsComponentRef>((props, ref) => {
  useImperativeHandle(ref, () => ({
    onSave: () => {
      // Custom save logic here
      console.log('ResponseSettingsWhiteboard onSave called!');
    },
  }));

  return (
    <div>
      <p>Whiteboard....</p>
    </div>
  );
});

export default ResponseSettingsWhiteboard;
