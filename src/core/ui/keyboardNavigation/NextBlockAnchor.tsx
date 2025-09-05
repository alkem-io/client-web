import {
  cloneElement,
  createContext,
  PropsWithChildren,
  ReactElement,
  RefObject,
  useCallback,
  useContext,
} from 'react';

type Anchor = {
  (): Element | null;
};

const BlockAnchorContext = createContext<Anchor | undefined>(undefined);

export const BlockAnchorProvider = ({
  blockRef,
  children,
}: PropsWithChildren<{ blockRef: RefObject<Element | null> }>) => {
  const anchor = useCallback(() => blockRef.current?.nextElementSibling ?? null, [blockRef]);

  return <BlockAnchorContext value={anchor}>{children}</BlockAnchorContext>;
};

type NextBlockAnchorProps<Props extends { anchor?: Anchor }> = {
  children: ReactElement<Props>;
};

export const NextBlockAnchor = <Props extends { anchor?: Anchor }>({ children }: NextBlockAnchorProps<Props>) => {
  const anchor = useNextBlockAnchor();

  return anchor ? cloneElement(children, { anchor } as Props) : null;
};

export const useNextBlockAnchor = () => useContext(BlockAnchorContext);
