import { createContext, type Dispatch, type ReactNode, type SetStateAction, useContext, useState } from 'react';

export type MemoSigningRestoreIntent = {
  attemptId: string;
  calloutId: string;
  memoId: string;
  kind: 'framing' | 'contribution';
  contributionId?: string;
  refreshMemo: boolean;
};

type MemoSigningReturnContextValue = {
  restoreIntent?: MemoSigningRestoreIntent;
  setRestoreIntent: Dispatch<SetStateAction<MemoSigningRestoreIntent | undefined>>;
};

const MemoSigningReturnContext = createContext<MemoSigningReturnContextValue>({
  setRestoreIntent: () => undefined,
});

export function MemoSigningReturnProvider({ children }: { children: ReactNode }) {
  const [restoreIntent, setRestoreIntent] = useState<MemoSigningRestoreIntent>();

  return <MemoSigningReturnContext value={{ restoreIntent, setRestoreIntent }}>{children}</MemoSigningReturnContext>;
}

export const useMemoSigningReturnContext = () => useContext(MemoSigningReturnContext);
