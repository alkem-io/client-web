import { Dispatch, SetStateAction, useEffect, useState } from 'react';

const useResettableState = <Value>(
  defaultValue: Value | undefined,
  dependencies: unknown[] = []
): [Value | undefined, Dispatch<SetStateAction<Value | undefined>>] => {
  const [state, setState] = useState(defaultValue);

  useEffect(() => {
    setState(defaultValue);
  }, dependencies);

  return [state, setState];
};

export default useResettableState;
