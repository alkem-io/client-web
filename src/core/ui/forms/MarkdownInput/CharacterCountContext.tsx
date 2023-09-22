import {
  createContext,
  Dispatch,
  forwardRef,
  PropsWithChildren,
  ReactElement,
  useContext,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

interface CharacterCountContextValue {
  characterCount: number;
  setCharacterCount: Dispatch<number>;
}

const CharacterCountContext = createContext<CharacterCountContextValue | null>(null);

export interface CharacterCountContextProviderRefValue {
  characterCount: number;
}

export const CharacterCountContextProvider = forwardRef<CharacterCountContextProviderRefValue, PropsWithChildren<{}>>(
  ({ children }, ref) => {
    const [characterCount, setCharacterCount] = useState(0);

    const contextValue = useMemo<CharacterCountContextValue>(
      () => ({ characterCount, setCharacterCount }),
      [characterCount, setCharacterCount]
    );

    useImperativeHandle(
      ref,
      () => ({
        characterCount,
      }),
      [characterCount]
    );

    return <CharacterCountContext.Provider value={contextValue}>{children}</CharacterCountContext.Provider>;
  }
);

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
  children: ({ characterCount: number }) => ReactElement | null;
}

export const CharacterCountContainer = ({ onChange, children }: CharacterCountContainerProps) => {
  const { characterCount } = useCharacterCountContext();
  useLayoutEffect(() => {
    onChange?.(characterCount);
  }, [characterCount]);

  return children({ characterCount });
};
