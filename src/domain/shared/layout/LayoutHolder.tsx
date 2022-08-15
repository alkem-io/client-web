import React, {
  ComponentType,
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';

interface LayoutState<P> {
  component: ComponentType<P>;
  props: P;
}

const createLayout = <P extends {}>(Component: ComponentType<P>) => {
  const LayoutContext = createContext<Dispatch<SetStateAction<LayoutState<P> | undefined>>>(() => {
    throw new Error('Not within the LayoutHolder.');
  });

  const LayoutHolder = ({ children }: PropsWithChildren<{}>) => {
    const [layout, setLayout] = useState<LayoutState<P>>();

    const Component = layout?.component!;

    return (
      <>
        {layout && <Component {...layout.props} />}
        <LayoutContext.Provider value={setLayout}>{children}</LayoutContext.Provider>
      </>
    );
  };

  const Layout = React.memo<P>(props => {
    const setLayout = useContext(LayoutContext);

    useLayoutEffect(() => {
      setLayout({
        component: Component,
        props,
      });
    }, [props]);

    return null;
  }) as FC<P>;

  return {
    LayoutHolder,
    Layout,
  };
};

export default createLayout;
