import {
  cloneElement,
  createContext,
  PropsWithChildren,
  ReactElement,
  RefObject,
  useCallback,
  useContext,
} from 'react';

interface Anchor {
  (): Element | null;
}

const BlockAnchorContext = createContext<Anchor | undefined>(undefined);

interface BlockAnchorProviderProps {
  blockRef: RefObject<Element | null>;
}

export const BlockAnchorProvider = ({ blockRef, children }: PropsWithChildren<BlockAnchorProviderProps>) => {
  const anchor = useCallback(() => blockRef.current?.nextElementSibling ?? null, [blockRef]);

  return <BlockAnchorContext.Provider value={anchor}>{children}</BlockAnchorContext.Provider>;
};

interface NextBlockAnchorProps<Props extends { anchor?: Anchor }> {
  children: ReactElement<Props>;
}

export const NextBlockAnchor = <Props extends { anchor?: Anchor }>({ children }: NextBlockAnchorProps<Props>) => {
  const anchor = useNextBlockAnchor();

  return anchor ? cloneElement(children, { anchor } as Props) : null;
};

export const useNextBlockAnchor = () => useContext(BlockAnchorContext);
