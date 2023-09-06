import { isEqual, omit } from 'lodash';

const WHITEBOARD_PROP_SOURCE = 'source';

const isWhiteboardContentEqual = (lWhiteboardContent: string | undefined, rWhiteboardContent: string | undefined) => {
  if (!lWhiteboardContent && !rWhiteboardContent) {
    return true;
  }
  if (!lWhiteboardContent || !rWhiteboardContent) {
    return false;
  }
  const lParsedContent = JSON.parse(lWhiteboardContent);
  const rParsedContent = JSON.parse(rWhiteboardContent);
  return isEqual(omit(lParsedContent, WHITEBOARD_PROP_SOURCE), omit(rParsedContent, WHITEBOARD_PROP_SOURCE));
};

export default isWhiteboardContentEqual;
