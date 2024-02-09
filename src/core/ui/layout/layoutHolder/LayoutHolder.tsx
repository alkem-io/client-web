import React, {
  ComponentType,
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  ReactElement,
  SetStateAction,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';

interface LayoutState<P> {
  component: ComponentType<P>;
  props: P;
}

type LayoutRenderOrderProps = PropsWithChildren<{
  layout: ReactElement | undefined;
}>;

const DefaultLayoutRenderOrder = ({ layout, children }: LayoutRenderOrderProps) => {
  return (
    <>
      {layout}
      {children}
    </>
  );
};

const createLayoutHolder = (RenderOrder: ComponentType<LayoutRenderOrderProps> = DefaultLayoutRenderOrder) => {
  const LayoutContext = createContext<Dispatch<SetStateAction<LayoutState<Record<string, unknown>> | undefined>>>(
    () => {
      throw new Error('Not within the LayoutHolder.');
    }
  );

  const LayoutHolder = ({ children }: PropsWithChildren<{}>) => {
    const [layout, setLayout] = useState<LayoutState<Record<string, unknown>>>();

    const Component = layout?.component!;

    return (
      <RenderOrder layout={layout && <Component {...layout.props} />}>
        <LayoutContext.Provider value={setLayout}>{children}</LayoutContext.Provider>
      </RenderOrder>
    );
  };

  const createLayout = <P extends {}>(Component: ComponentType<P>) => {
    const Layout = React.memo<P>(props => {
      const setLayout = useContext(LayoutContext);

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
    createLayout,
  };
};

export default createLayoutHolder;
