import {
  createContext,
  Dispatch,
  PropsWithChildren,
  ReactElement,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

type CharacterCountContextValue = {
  characterCount: number;
  setCharacterCount: Dispatch<number>;
};

const CharacterCountContext = createContext<CharacterCountContextValue | null>(null);

export const CharacterCountContextProvider = ({ children }: PropsWithChildren) => {
  const [characterCount, setCharacterCount] = useState(0);

  const contextValue = useMemo<CharacterCountContextValue>(
    () => ({ characterCount, setCharacterCount }),
    [characterCount, setCharacterCount]
  );

  return <CharacterCountContext value={contextValue}>{children}</CharacterCountContext>;
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
  onChange?: (characterCount: number) => void;
  children: ({ characterCount }) => ReactElement | null;
}

export const CharacterCountContainer = ({ onChange, children }: CharacterCountContainerProps) => {
  const { characterCount } = useCharacterCountContext();

  useLayoutEffect(() => {
    onChange?.(characterCount);
  }, [characterCount]);

  return children({ characterCount });
};
