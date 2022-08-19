import CalloutLayout, { CalloutLayoutProps } from './CalloutLayout';
import React from 'react';
import SimpleCardsList from '../shared/components/SimpleCardsList';
import SimpleCard from '../shared/components/SimpleCard';
import { WbIncandescentOutlined } from '@mui/icons-material';
import { LinkWithState } from '../shared/types/LinkWithState';

interface Canvas {
  id: string;
  nameID: string;
  displayName: string;
  preview?: {
    uri: string;
  };
}

interface CanvasCalloutProps {
  callout: CalloutLayoutProps['callout'] & {
    canvases: Canvas[];
  };
  buildCanvasUrl: (canvasId: string) => LinkWithState;
}

const CanvasCallout = ({ callout, buildCanvasUrl }: CanvasCalloutProps) => {
  return (
    <CalloutLayout callout={callout} maxHeight={18}>
      <SimpleCardsList>
        {callout.canvases.map(canvas => (
          <SimpleCard
            key={canvas.id}
            {...buildCanvasUrl(canvas.nameID)}
            title={canvas.displayName}
            imageUrl={canvas.preview?.uri}
            iconComponent={WbIncandescentOutlined}
          />
        ))}
      </SimpleCardsList>
    </CalloutLayout>
  );
};

export default CanvasCallout;
