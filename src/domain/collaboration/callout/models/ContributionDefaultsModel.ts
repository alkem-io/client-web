export interface ContributionDefaultsModel {
  defaultDisplayName?: string;
  postDescription?: string;
  whiteboardContentAvailable?: boolean;
  /** ID of the server-owned live draft Whiteboard. */
  draftWhiteboardID?: string;
  sourceWhiteboardID?: string;
  sourceCalloutID?: string;
  clearWhiteboardContent?: boolean;
}
