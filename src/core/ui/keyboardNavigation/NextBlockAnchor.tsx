import { createContext, PropsWithChildren, RefObject, useContext, useEffect, useState } from 'react';

const BlockAnchorContext = createContext('');

interface BlockAnchorProviderProps {
  blockRef: RefObject<Element | null>;
}

export const BlockAnchorProvider = ({ blockRef, children }: PropsWithChildren<BlockAnchorProviderProps>) => {
  const [nextBlockAnchor, setNextBlockAnchor] = useState('');

  useEffect(() => {
    const nextBlockId = blockRef.current?.nextElementSibling?.id;

    if (nextBlockId) {
      setNextBlockAnchor(nextBlockId);
    }
  }, [blockRef]);

  return <BlockAnchorContext.Provider value={nextBlockAnchor}>{children}</BlockAnchorContext.Provider>;
};

export const useNextBlockAnchor = () => useContext(BlockAnchorContext);
