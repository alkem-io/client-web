import { Loading as CrdLoading } from '@/crd/components/common/Loading';

/**
 * Route-level loading fallback — the same `LoadingSpinner` every other loading state
 * uses, grown to fill the main area. `min-h-[calc(100vh-4rem)]` (viewport minus the
 * h-16 header) keeps the footer below the fold while a page chunk loads, so it isn't
 * pushed out of view the moment the page renders (issue #10043).
 */
const Loading = ({ text }: { text?: string }) => <CrdLoading text={text} className="grow min-h-[calc(100vh-4rem)]" />;

export default Loading;
