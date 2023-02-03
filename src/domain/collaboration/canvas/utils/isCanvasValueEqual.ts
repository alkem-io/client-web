import { isEqual, omit } from 'lodash';

const CANVAS_PROP_SOURCE = 'source';

const isCanvasValueEqual = (lCanvasValue: string | undefined, rCanvasValue: string | undefined) => {
  if (!lCanvasValue && !rCanvasValue) {
    return true;
  }
  if (!lCanvasValue || !rCanvasValue) {
    return false;
  }
  const lParsedValue = JSON.parse(lCanvasValue);
  const rParsedValue = JSON.parse(rCanvasValue);
  return isEqual(omit(lParsedValue, CANVAS_PROP_SOURCE), omit(rParsedValue, CANVAS_PROP_SOURCE));
};

export default isCanvasValueEqual;
