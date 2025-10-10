import { useMemoDetailsQuery, useMemoMarkdownLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { MemoModelFull } from '../model/MemoModelFull';
import { useCallback } from 'react';

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

  const refreshMarkdown = useCallback(async () => {
    if (id) {
      await fetchMarkdown({ variables: { id: id } });
      return;
    }
  }, [fetchMarkdown, id]);

  const memo: MemoModelFull | undefined = data?.lookup.memo;

  return {
    memo,
    loading,
    refreshMarkdown,
  };
};

export default useMemoManager;
