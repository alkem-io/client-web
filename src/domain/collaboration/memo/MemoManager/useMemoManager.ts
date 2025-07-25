import { useMemoDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import { MemoModelFull } from '../model/MemoModelFull';

interface useMemoManagerProvided {
  memo: MemoModelFull | undefined;
  onDeleteMemo?: () => Promise<unknown>;
  loading: boolean;
}

interface useMemoManagerProps {
  id: string | undefined;
}

const useMemoManager = ({ id }: useMemoManagerProps): useMemoManagerProvided => {
  const { data, loading } = useMemoDetailsQuery({
    variables: { id: id! },
    skip: !id,
  });

  const memo: MemoModelFull | undefined = data?.lookup.memo;

  return {
    memo,
    loading,
  };
};

export default useMemoManager;
