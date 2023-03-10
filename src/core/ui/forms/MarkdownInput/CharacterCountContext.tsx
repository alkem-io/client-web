import { createContext, Dispatch, PropsWithChildren, ReactElement, useContext, useMemo, useState } from 'react';

interface CharacterCountContextValue {
  characterCount: number;
  setCharacterCount: Dispatch<number>;
}

const CharacterCountContext = createContext<CharacterCountContextValue | null>(null);

export const CharacterCountContextProvider = ({ children }: PropsWithChildren<{}>) => {
  const [characterCount, setCharacterCount] = useState(0);

  const contextValue = useMemo<CharacterCountContextValue>(
    () => ({ characterCount, setCharacterCount }),
    [characterCount, setCharacterCount]
  );

  return <CharacterCountContext.Provider value={contextValue}>{children}</CharacterCountContext.Provider>;
};

const useCharacterCountContext = () => {
  const context = useContext(CharacterCountContext);
  if (!context) {
    throw new Error('Must be wrapped in CharacterCountContextProvider');
  }
  return context;
};

export const useSetCharacterCount = () => {
  const { setCharacterCount } = useCharacterCountContext();
  return setCharacterCount;
};

interface CharacterCountContainerProps {
  children: ({ characterCount: number }) => ReactElement | null;
}

export const CharacterCountContainer = ({ children }: CharacterCountContainerProps) => {
  const { characterCount } = useCharacterCountContext();
  return children({ characterCount });
};
