import React, {
  ComponentType,
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

type LayoutState<P> = {
  component: ComponentType<P>;
  props: P;
};

type LayoutContext = {
  layout: LayoutState<Record<string, unknown>> | undefined;
  setLayout: Dispatch<SetStateAction<LayoutState<Record<string, unknown>> | undefined>>;
};

const createLayoutHolder = () => {
  const LayoutContext = createContext<LayoutContext>({
    layout: undefined,
    setLayout: () => {
      return;
      throw new Error('Not within the LayoutHolder.');
    },
  });

  const RenderPoint = () => {
    const { layout } = useContext(LayoutContext);
    if (!layout) {
      return null;
    }
    const Component = layout.component;
    return <Component {...layout.props} />;
  };

  const LayoutHolder = ({ children }: PropsWithChildren<{}>) => {
    const [layout, setLayout] = useState<LayoutState<Record<string, unknown>>>();

    const contextValue = useMemo(() => ({ layout, setLayout }), [layout, setLayout]);

    return <LayoutContext.Provider value={contextValue}>{children}</LayoutContext.Provider>;
  };

  const createLayout = <P extends {}>(Component: ComponentType<P>) => {
    const Layout = React.memo<P>(props => {
      const { setLayout } = useContext(LayoutContext);

      useLayoutEffect(() => {
        setLayout({
          component: Component as ComponentType<Record<string, unknown>>,
          props,
        });
      }, [props, setLayout]);

      return null;
    }) as FC<P>;

    return Layout;
  };

  return {
    LayoutHolder,
    RenderPoint,
    createLayout,
  };
};

export default createLayoutHolder;
