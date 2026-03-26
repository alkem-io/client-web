import { useMemoDetailsQuery, useMemoMarkdownLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import type { MemoModelFull } from '../model/MemoModelFull';

interface useMemoManagerProvided {
  memo: MemoModelFull | undefined;
  loading: boolean;
  refreshMarkdown: () => Promise<void>;
}

interface useMemoManagerProps {
  id: string | undefined;
}

const useMemoManager = ({ id }: useMemoManagerProps): useMemoManagerProvided => {
  const { data, loading } = useMemoDetailsQuery({
    variables: { id: id! },
    skip: !id,
  });

  const [fetchMarkdown] = useMemoMarkdownLazyQuery({ fetchPolicy: 'network-only' });

  const refreshMarkdown = async () => {
    if (id) {
      await fetchMarkdown({ variables: { id: id } });
      return;
    }
  };

  const memo: MemoModelFull | undefined = data?.lookup.memo;

  return {
    memo,
    loading,
    refreshMarkdown,
  };
};

export default useMemoManager;
