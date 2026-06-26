import { CrdNotFoundView } from '@/main/crdPages/error/CrdNotFoundView';
import { CrdLayoutWrapper } from '@/main/ui/layout/CrdLayoutWrapper';

export function CrdNotFoundBranch() {
  return (
    <CrdLayoutWrapper>
      <CrdNotFoundView />
    </CrdLayoutWrapper>
  );
}
