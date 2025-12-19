import { useSearchParams } from 'react-router-dom';
import { TabbedLayoutParams } from '@/main/routing/urlBuilders';

/**
 * Returns the current tab position (0-based) from the URL 'tab' param.
 * URL param is 1-based (default 1), this hook converts to 0-based for internal use.
 */
const useCurrentTabPosition = () => {
  const [searchParams] = useSearchParams();
  return Number.parseInt(searchParams.get(TabbedLayoutParams.Section) ?? '1', 10) - 1;
};

export default useCurrentTabPosition;
