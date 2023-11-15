import { isEqual, omit } from 'lodash';

const IGNORED_PROPERTIES = ['source', 'appState'];
const isWhiteboardContentEqual = (lWhiteboardContent: string | undefined, rWhiteboardContent: string | undefined) => {
  if (!lWhiteboardContent && !rWhiteboardContent) {
    return true;
  }
  if (!lWhiteboardContent || !rWhiteboardContent) {
    return false;
  }
  const lParsedContent = JSON.parse(lWhiteboardContent);
  const rParsedContent = JSON.parse(rWhiteboardContent);
  return isEqual(omit(lParsedContent, IGNORED_PROPERTIES), omit(rParsedContent, IGNORED_PROPERTIES));
};

export default isWhiteboardContentEqual;
