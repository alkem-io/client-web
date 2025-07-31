export const MESSAGE_BOX_SCROLL_DURATION = 400;

export const MESSAGE_SENDER = {
  CLIENT: 'client',
  RESPONSE: 'response',
};

export const MESSAGES_TYPES = {
  TEXT: 'text',
  SNIPPET: {
    LINK: 'snippet',
  },
  CUSTOM_COMPONENT: 'component',
};

export const getCaretIndex = el => {
  let position = 0;
  const selection = window.getSelection()!;
  if (selection.rangeCount !== 0) {
    const range = window.getSelection()!.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(el);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    position = preCaretRange.toString().length;
  }
  return position;
};

export const isFirefox = () => navigator.userAgent.search('Firefox') > 0;

export const updateCaret = (el, caret, offset) => {
  const range = document.createRange();
  const selection = window.getSelection()!;
  range.setStart(el.childNodes[0], caret + offset);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  el.focus();
};

export const insertNodeAtCaret = el => {
  const position = getCaretIndex(el);
  let characterToEnter = '\n\n';
  let prevChar,
    char = '';
  if (position > 0) {
    prevChar = el.innerHTML.charAt(position - 1);
    char = el.innerHTML.charAt(position);
    const newLines = el.innerHTML.match(/\n/g);
    if (prevChar === char || (prevChar === '\n' && char === '') || (isFirefox() && newLines?.length > 0)) {
      characterToEnter = '\n';
    }
  }
  const selection = window.getSelection()!;
  const node = document.createTextNode(characterToEnter);
  const range = selection.getRangeAt(0);
  range.collapse(false);
  range.insertNode(node);
  const cloneRange = range.cloneRange();
  cloneRange.selectNodeContents(node);
  cloneRange.collapse(false);
  selection.removeAllRanges();
  selection.addRange(cloneRange);
  el.innerHTML = el.innerHTML.replace(/<br>/g, '');
  updateCaret(el, position, 1);
};

export const getSelection = el => {
  const range = window.getSelection()!.getRangeAt(0);
  const preSelectionRange = range.cloneRange();
  preSelectionRange.selectNodeContents(el);
  preSelectionRange.setEnd(range.startContainer, range.startOffset);

  const start = preSelectionRange.toString().length;
  return {
    start: start,
    end: start + range.toString().length,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sinEaseOut(timestamp: any, beginning: any, change: any, duration: any) {
  return change * ((timestamp = timestamp / duration - 1) * timestamp * timestamp + 1) + beginning;
}

/**
 *
 * @param {*} target scroll target
 * @param {*} scrollStart
 * @param {*} scroll scroll distance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function scrollWithSlowMotion(target: any, scrollStart: any, scroll: number) {
  const raf = window?.requestAnimationFrame;
  let start = 0;
  const step = timestamp => {
    if (!start) {
      start = timestamp;
    }
    let stepScroll = sinEaseOut(timestamp - start, 0, scroll, MESSAGE_BOX_SCROLL_DURATION);
    let total = scrollStart + stepScroll;
    target.scrollTop = total;
    if (total < scrollStart + scroll) {
      raf(step);
    }
  };
  raf(step);
}

export function scrollToBottom(messagesDiv: HTMLDivElement | null) {
  if (!messagesDiv) return;
  const screenHeight = messagesDiv.clientHeight;
  const scrollTop = messagesDiv.scrollTop;
  const scrollOffset = messagesDiv.scrollHeight - (scrollTop + screenHeight);
  if (scrollOffset) scrollWithSlowMotion(messagesDiv, scrollTop, scrollOffset);
}
