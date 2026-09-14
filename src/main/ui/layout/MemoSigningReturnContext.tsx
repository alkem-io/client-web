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

export type MemoSigningRouteSettlement = {
  attemptId: string;
};

type MemoSigningReturnContextValue = {
  restoreIntent?: MemoSigningRestoreIntent;
  setRestoreIntent: Dispatch<SetStateAction<MemoSigningRestoreIntent | undefined>>;
  restoreResolution?: MemoSigningRestoreResolution;
  setRestoreResolution: Dispatch<SetStateAction<MemoSigningRestoreResolution | undefined>>;
  routeSettlementRequest?: MemoSigningRouteSettlement;
  setRouteSettlementRequest: Dispatch<SetStateAction<MemoSigningRouteSettlement | undefined>>;
  routeSettlement?: MemoSigningRouteSettlement;
  setRouteSettlement: Dispatch<SetStateAction<MemoSigningRouteSettlement | undefined>>;
};

const MemoSigningReturnContext = createContext<MemoSigningReturnContextValue>({
  setRestoreIntent: () => undefined,
  setRestoreResolution: () => undefined,
  setRouteSettlementRequest: () => undefined,
  setRouteSettlement: () => undefined,
});

export function MemoSigningReturnProvider({ children }: { children: ReactNode }) {
  const [restoreIntent, setRestoreIntent] = useState<MemoSigningRestoreIntent>();
  const [restoreResolution, setRestoreResolution] = useState<MemoSigningRestoreResolution>();
  const [routeSettlementRequest, setRouteSettlementRequest] = useState<MemoSigningRouteSettlement>();
  const [routeSettlement, setRouteSettlement] = useState<MemoSigningRouteSettlement>();

  return (
    <MemoSigningReturnContext
      value={{
        restoreIntent,
        setRestoreIntent,
        restoreResolution,
        setRestoreResolution,
        routeSettlementRequest,
        setRouteSettlementRequest,
        routeSettlement,
        setRouteSettlement,
      }}
    >
      {children}
    </MemoSigningReturnContext>
  );
}

export const useMemoSigningReturnContext = () => useContext(MemoSigningReturnContext);
