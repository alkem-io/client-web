import { createContext, type Dispatch, type ReactNode, type SetStateAction, useContext, useState } from 'react';

export type MemoSigningRestoreIntent = {
  attemptId: string;
  calloutId: string;
  memoId: string;
  kind: 'framing' | 'contribution';
  contributionId?: string;
  refreshMemo: boolean;
};

export type MemoSigningRestoreResolution = {
  attemptId: string;
  focusTarget?: HTMLElement;
};

type MemoSigningReturnContextValue = {
  restoreIntent?: MemoSigningRestoreIntent;
  setRestoreIntent: Dispatch<SetStateAction<MemoSigningRestoreIntent | undefined>>;
  restoreResolution?: MemoSigningRestoreResolution;
  setRestoreResolution: Dispatch<SetStateAction<MemoSigningRestoreResolution | undefined>>;
};

const MemoSigningReturnContext = createContext<MemoSigningReturnContextValue>({
  setRestoreIntent: () => undefined,
  setRestoreResolution: () => undefined,
});

export function MemoSigningReturnProvider({ children }: { children: ReactNode }) {
  const [restoreIntent, setRestoreIntent] = useState<MemoSigningRestoreIntent>();
  const [restoreResolution, setRestoreResolution] = useState<MemoSigningRestoreResolution>();

  return (
    <MemoSigningReturnContext value={{ restoreIntent, setRestoreIntent, restoreResolution, setRestoreResolution }}>
      {children}
    </MemoSigningReturnContext>
  );
}

export const useMemoSigningReturnContext = () => useContext(MemoSigningReturnContext);
