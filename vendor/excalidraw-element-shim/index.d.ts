// Types for the `@excalidraw/element` runtime shim (see index.js).
export declare const CaptureUpdateAction: {
  readonly IMMEDIATELY: 'IMMEDIATELY';
  readonly NEVER: 'NEVER';
  readonly EVENTUALLY: 'EVENTUALLY';
};
export type CaptureUpdateActionType = (typeof CaptureUpdateAction)[keyof typeof CaptureUpdateAction];
