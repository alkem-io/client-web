import { cloneElement, createContext, PropsWithChildren, ReactElement, useContext, useEffect, useState } from 'react';

const BlockAnchorContext = createContext<Element | null | undefined>(undefined);

interface BlockAnchorProviderProps {
  block: Element | null;
}

export const BlockAnchorProvider = ({ block, children }: PropsWithChildren<BlockAnchorProviderProps>) => {
  const [nextBlock, setNextBlock] = useState<Element | null | undefined>();

  useEffect(() => {
    const nextBlock = block?.nextElementSibling;

    if (nextBlock) {
      setNextBlock(nextBlock);
    }
  }, [block]);

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
