import React, { ReactNode, useLayoutEffect, useReducer, useRef } from 'react';
import LinesFitterErrorBoundary from './LinesFitterErrorBoundary';

enum Stage {
  MEASURING_EXPECTED_HEIGHT,
  FILLING_WITH_CHILDREN,
  REMOVING_CHILDREN,
  FINISHED,
}

interface LinesFitterState {
  stage: Stage;
  itemsToDisplayCount: number;
  expectedHeight: number;
}

enum ActionTypes {
  SetExpectedHeight,
  AddChild,
  RemoveChild,
  Finish,
}

interface Action<ActionType> {
  type: ActionType;
}

interface ActionSetExpectedHeight extends Action<ActionTypes.SetExpectedHeight> {
  payload: number;
}

interface ActionAddChild extends Action<ActionTypes.AddChild> {}
interface ActionRemoveChild extends Action<ActionTypes.RemoveChild> {}
interface ActionFinish extends Action<ActionTypes.Finish> {}

type HandledAction = ActionSetExpectedHeight | ActionAddChild | ActionRemoveChild | ActionFinish;

const getNextState = (state: LinesFitterState, action: HandledAction): LinesFitterState => {
  switch (action.type) {
    case ActionTypes.SetExpectedHeight: {
      return {
        ...state,
        stage: Stage.FILLING_WITH_CHILDREN,
        expectedHeight: action.payload,
        itemsToDisplayCount: 1,
      };
    }
    case ActionTypes.AddChild: {
      return {
        ...state,
        itemsToDisplayCount: state.itemsToDisplayCount + 1,
      };
    }
    case ActionTypes.RemoveChild: {
      return {
        ...state,
        stage: Stage.REMOVING_CHILDREN,
        itemsToDisplayCount: state.itemsToDisplayCount - 1,
      };
    }
    case ActionTypes.Finish: {
      return {
        ...state,
        stage: Stage.FINISHED,
      };
    }
    default:
      return state as never;
  }
};

const initialState: LinesFitterState = {
  stage: Stage.MEASURING_EXPECTED_HEIGHT,
  itemsToDisplayCount: 0,
  expectedHeight: 0,
};

export interface LinesFitterProps<Item>
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  items: Item[];
  renderItem: (item: Item, index: number) => ReactNode;
  renderMore?: (remainingItems: Item[]) => ReactNode;
}

/**
 * A component that limits the number of items in a Flex container with the flex-flow = row-wrap.
 * The number of items is limited so that the height of the container does not exceed the initial height,
 * when no items are rendered yet. So, to define the boundary you need to set `min-height` on the component
 * (using `className` or `style` - all props are proxied to the wrapper `<div>`).
 */
const LinesFitter = <Item,>({ items, renderItem, renderMore, ...wrapperProps }: LinesFitterProps<Item>) => {
  const wrapperElementRef = useRef<HTMLDivElement>(null);

  const [state, dispatch] = useReducer(getNextState, initialState);

  const measureWrapperHeight = () => {
    const element = wrapperElementRef.current!;
    const { height } = element.getBoundingClientRect();
    return height;
  };

  useLayoutEffect(() => {
    const height = measureWrapperHeight();

    switch (state.stage) {
      case Stage.MEASURING_EXPECTED_HEIGHT: {
        dispatch({
          type: ActionTypes.SetExpectedHeight,
          payload: height,
        });
        return;
      }
      case Stage.FILLING_WITH_CHILDREN: {
        if (height > state.expectedHeight) {
          dispatch({
            type: ActionTypes.RemoveChild,
          });
        } else if (state.itemsToDisplayCount < items.length) {
          dispatch({
            type: ActionTypes.AddChild,
          });
        } else {
          dispatch({
            type: ActionTypes.Finish,
          });
        }
        return;
      }
      case Stage.REMOVING_CHILDREN: {
        if (height > state.expectedHeight) {
          dispatch({
            type: ActionTypes.RemoveChild,
          });
        } else {
          dispatch({
            type: ActionTypes.Finish,
          });
        }
        return;
      }
    }
  }, [state]);

  const visibleItems = items.slice(0, state.itemsToDisplayCount);
  const showMore =
    (state.stage === Stage.REMOVING_CHILDREN || state.stage === Stage.FINISHED) &&
    state.itemsToDisplayCount < items.length;

  const getRemainingItems = () => items.slice(state.itemsToDisplayCount);

  return (
    <div ref={wrapperElementRef} {...wrapperProps}>
      {visibleItems.map(renderItem)}
      {showMore && renderMore?.(getRemainingItems())}
    </div>
  );
};

/**
 * Since LinesFitter is a state machine, it's theoretically possible that it goes into a loop
 * (e.g. when min-height was forgotten to be provided).
 * In order not to destroy user experience in production, in case of exception an empty container is returned.
 */
const SilentLinesFitter = <Item,>(props: LinesFitterProps<Item>) => {
  const { items, renderItem, renderMore, ref, ...wrapperProps } = props;

  return (
    <LinesFitterErrorBoundary {...wrapperProps}>
      <LinesFitter {...props} />
    </LinesFitterErrorBoundary>
  );
};

export default process.env.NODE_ENV === 'production' ? SilentLinesFitter : LinesFitter;
