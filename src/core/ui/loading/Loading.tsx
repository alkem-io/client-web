import { Loading as CrdLoading } from '@/crd/components/common/Loading';

/**
 * Route-level loading fallback — the same `LoadingSpinner` every other loading state
 * uses, grown to fill the main area between the header and the footer.
 */
const Loading = ({ text }: { text?: string }) => <CrdLoading text={text} className="grow" />;

export default Loading;
