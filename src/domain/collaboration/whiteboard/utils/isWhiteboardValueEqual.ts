import { isEqual, omit } from 'lodash';

const WHITEBOARD_PROP_SOURCE = 'source';

const isWhiteboardValueEqual = (lWhiteboardValue: string | undefined, rWhiteboardValue: string | undefined) => {
  if (!lWhiteboardValue && !rWhiteboardValue) {
    return true;
  }
  if (!lWhiteboardValue || !rWhiteboardValue) {
    return false;
  }
  const lParsedValue = JSON.parse(lWhiteboardValue);
  const rParsedValue = JSON.parse(rWhiteboardValue);
  return isEqual(omit(lParsedValue, WHITEBOARD_PROP_SOURCE), omit(rParsedValue, WHITEBOARD_PROP_SOURCE));
};

export default isWhiteboardValueEqual;
