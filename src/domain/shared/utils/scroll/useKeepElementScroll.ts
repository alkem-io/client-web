import { RefObject, useEffect, useRef } from 'react';

interface UseKeepElementScrollOptions {
  scrollContainerRef?: RefObject<HTMLElement | null>;
}

interface KeepElementScrollProvided {
  /**
   * Call right before (or just after) adding content that will push the anchor element upwards or downwards.
   * Provide the element you want to visually keep at the same vertical position inside the scroll container.
   */
  keepElementScroll: (anchor: HTMLElement | null) => void;
}

interface KeepElementScrollState {
  enabled: boolean;
  scroller: HTMLElement | undefined;
  mutationObserver: MutationObserver | undefined;
  anchor: HTMLElement | undefined;
  baselineTop: number;
}

/**
 * Keeps an anchor element (e.g. the message text field) visually in the same vertical position inside a scroll container
 * while new content above is appended (e.g. newly posted message or reply). Works for bottom anchored chat inputs.
 *
 * Behavior:
 *  - Call keepElementScroll(anchorEl) when the user submits a message/reply.
 *  - The hook records the anchor's top offset relative to the scroll container.
 *  - Uses MutationObserver to perform discrete immediate scrollTop adjustments with native browser scrolling APIs.
 */
const useKeepElementScroll = ({ scrollContainerRef }: UseKeepElementScrollOptions): KeepElementScrollProvided => {
  const log = (_text: string, ..._args: unknown[]) => {
    // TODO: Delete all these log() calls when this component is fully stable
    // console.log(`[useKeepElementScroll] ${_text}`, ..._args);
  };

  const stateRef = useRef<KeepElementScrollState>({
    enabled: false,
    scroller: undefined,
    mutationObserver: undefined,
    anchor: undefined,
    baselineTop: 0,
  });

  useEffect(() => {
    log('init');

    const container = scrollContainerRef?.current;
    const state = stateRef.current;
    if (!container) {
      return;
    }
    // eslint-disable-next-line react-compiler/react-compiler -- DOM property mutation is valid
    container.style.scrollBehavior = 'smooth';
    state.scroller = container;
    return () => {
      log('cleanup');
      clearObservers();
      if (state.scroller) {
        state.scroller = undefined;
      }
    };
  }, [scrollContainerRef]);

  const clearObservers = () => {
    log('clearObservers');
    const state = stateRef.current;
    if (state.mutationObserver) {
      state.mutationObserver.disconnect();
      state.mutationObserver = undefined;
    }
    state.anchor = undefined;
    state.baselineTop = 0;
    state.enabled = false;
  };

  const hookObservers = (anchorEl: HTMLElement) => {
    const state = stateRef.current;
    if (!state.scroller) return;

    // Clean previous observers
    clearObservers();
    // Observe DOM mutations (new messages appended, replies, etc.)
    state.mutationObserver = new MutationObserver(() => {
      log('mutationObserver');
      compensateScroll();
    });
    state.mutationObserver.observe(state.scroller, { subtree: true, childList: true, characterData: false });

    const containerRect = state.scroller.getBoundingClientRect();
    const anchorRect = anchorEl.getBoundingClientRect();
    state.anchor = anchorEl;
    state.baselineTop = anchorRect.top - containerRect.top;

    log('hookingObservers', { anchorEl, state, containerRect, anchorRect, baselineTop: state.baselineTop });

    state.enabled = true;
  };

  const compensateScroll = () => {
    const state = stateRef.current;
    if (!state.scroller || !state.anchor || !state.enabled) {
      clearObservers();
      return;
    }
    const containerRect = state.scroller.getBoundingClientRect();
    const anchorRect = state.anchor.getBoundingClientRect();
    const newBaseline = anchorRect.top - containerRect.top;
    const scrollTop = state.scroller.scrollTop + (newBaseline - state.baselineTop);
    if (newBaseline - state.baselineTop === 0) {
      log('No need to compensate, same position', { newBaseline, oldBaseline: state.baselineTop, state });
    } else {
      log('trigger scrollTo', {
        newBaseline,
        oldBaseline: state.baselineTop,
        currentScrollTop: state.scroller.scrollTop,
        scrollTop,
      });
      state.scroller.scrollTo({ top: scrollTop, behavior: 'smooth' });
      clearObservers(); // only scroll once per mutation/resize batch
    }
  };

  const keepElementScroll = (anchorEl: HTMLElement | null) => {
    const state = stateRef.current;
    if (!state.scroller || !anchorEl) {
      log('keepElementScroll: missing scroller or anchorEl', state, anchorEl);
      return;
    }

    hookObservers(anchorEl);
  };

  return { keepElementScroll };
};

export default useKeepElementScroll;
