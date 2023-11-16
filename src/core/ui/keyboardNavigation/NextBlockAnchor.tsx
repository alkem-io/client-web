import {
  cloneElement,
  createContext,
  PropsWithChildren,
  ReactElement,
  RefObject,
  useContext,
  useEffect,
  useState,
} from 'react';

const BlockAnchorContext = createContext<Element | null | undefined>(undefined);

interface BlockAnchorProviderProps {
  blockRef: RefObject<Element | null>;
}

export const BlockAnchorProvider = ({ blockRef, children }: PropsWithChildren<BlockAnchorProviderProps>) => {
  const [nextBlock, setNextBlock] = useState<Element | null | undefined>();

  useEffect(() => {
    const nextBlock = blockRef.current?.nextElementSibling;

    if (nextBlock) {
      setNextBlock(nextBlock);
    }
  }, [blockRef]);

  return <BlockAnchorContext.Provider value={nextBlock}>{children}</BlockAnchorContext.Provider>;
};

interface NextBlockAnchorProps<Props extends { anchor?: Element | null }> {
  children: ReactElement<Props>;
}

export const NextBlockAnchor = <Props extends { anchor?: Element | null }>({
  children,
}: NextBlockAnchorProps<Props>) => {
  const nextBlock = useNextBlock();

  return nextBlock ? cloneElement(children, { anchor: nextBlock } as Props) : null;
};

export const useNextBlock = () => useContext(BlockAnchorContext);
