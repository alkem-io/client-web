import { RefObject, useEffect, useRef } from 'react';

interface UseAutomaticTooltipResult {
  containerReference: RefObject<HTMLDivElement | null>;
  addAutomaticTooltip: (element: HTMLElement | null, tooltipText?: string) => void;
}
/**
 * This is a hook to handle text elements that may be too long to be displayed in small screens.
 * Will check the parent container element and see if the text element fits inside and if not,
 * the hook will add the title attribute automatically.
 *
 * Usage:
 *  useAutomaticTooltip will return an object with two properties.
 *  containerReference: A React ref to the container object
 *  addAutomaticTooltip: A function to add refs to every text element that you want to handle with this hook,
 *    with an optional string parameter which will be the tooltip text if provided.
 *    If no string is provided, the actual text inside the element [HTML .textContent] will be used as tooltip.
 *
 * Example:
 *    const  { containerReference, addAutomaticTooltip } = useAutomaticTooltip();
 *    return (
 *      <Root ref={containerReference}>
 *        <WrapperTypography ref={e => addAutomaticTooltip(e, 'optional tooltip or just veryLongText contents')}>
 *          {veryLongText}
 *         </WrapperTypography>
 *      </Root>
 *    );
 *
 * CSS:
 *  Keep in mind that for this to work:
 *    - Container: must have a width, overflow: 'hidden', text-overflow: 'ellipsis'
 *    - Text elements inside: must be display: 'inline, white-space: 'nowrap'
 *
 * @returns UseAutomaticTooltipResult
 */

const useAutomaticTooltip = (): UseAutomaticTooltipResult => {
  const container = useRef<HTMLDivElement>(null);
  const refs = useRef<HTMLElement[]>([]);
  const addRef = function (element: HTMLElement | null, tooltip?: string) {
    if (element !== null && refs.current.indexOf(element) === -1) {
      element.dataset.tooltip = tooltip;
      refs.current.push(element);
    }
  };

  useEffect(() => {
    refs.current?.forEach(element => {
      if (element && element.parentElement) {
        // Detect if text-overflow: ellipsis is being applied:
        if (element.parentElement.offsetWidth < element.offsetWidth) {
          if (element.dataset.tooltip && element.dataset.tooltip !== 'undefined') {
            element.title = element.dataset.tooltip;
          } else {
            element.title = element.textContent || '';
          }
        } else {
          element.title = '';
        }
      }
    });
  }, []);

  return {
    containerReference: container,
    addAutomaticTooltip: addRef,
  };
};

export default useAutomaticTooltip;
