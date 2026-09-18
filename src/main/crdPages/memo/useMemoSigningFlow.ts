import { useRef, useState } from 'react';
import type { MemoSigningStage } from '@/crd/components/memo/MemoSigningDialog';
import { type MemoSigningOrigin, writeMemoSigningReturnRecord } from '@/main/ui/layout/memoSigningReturnStorage';

type PreparedAttempt = { attemptId: string; previewUrl: string };

type UseMemoSigningFlowOptions = {
  memoId: string;
  requestDurability: () => Promise<void>;
  prepare: (memoId: string) => Promise<PreparedAttempt>;
  continueSigning: (attemptId: string) => Promise<string>;
  navigate: (url: string) => void;
  returnContext?: MemoSigningOrigin;
};

export function useMemoSigningFlow({
  memoId,
  requestDurability,
  prepare: prepareMutation,
  continueSigning: continueMutation,
  navigate,
  returnContext,
}: UseMemoSigningFlowOptions) {
  const [stage, setStage] = useState<MemoSigningStage>('idle');
  const [attempt, setAttempt] = useState<PreparedAttempt>();
  const preparing = useRef(false);
  const continuing = useRef(false);

  const prepare = async () => {
    if (preparing.current) return;
    preparing.current = true;
    setStage('preparing');
    setAttempt(undefined);
    try {
      await requestDurability();
      const prepared = await prepareMutation(memoId);
      setAttempt(prepared);
      setStage('preview');
    } catch {
      setStage('prepare-error');
    } finally {
      preparing.current = false;
    }
  };

  const continueSigning = async () => {
    if (!attempt || continuing.current) return;
    continuing.current = true;
    setStage('continuing');
    try {
      const authorizeUrl = await continueMutation(attempt.attemptId);
      if (returnContext) {
        writeMemoSigningReturnRecord(attempt.attemptId, returnContext);
      }
      navigate(authorizeUrl);
    } catch {
      setStage('continue-error');
      continuing.current = false;
    }
  };

  return { stage, attempt, prepare, continueSigning };
}
