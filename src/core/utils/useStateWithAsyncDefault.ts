import { Dispatch, SetStateAction, useLayoutEffect, useState } from 'react';

const useStateWithAsyncDefault = <Value>(
  defaultValue: Value | undefined
): [Value | undefined, Dispatch<SetStateAction<Value | undefined>>] => {
  const [state, setState] = useState(defaultValue);

  useLayoutEffect(() => {
    setState(prevState => {
      // We don't want to reset the state if already set
      // Callback form of setState allows to avoid race conditions
      return prevState ?? defaultValue;
    });
  }, [defaultValue]);

  return [state, setState];
};

export default useStateWithAsyncDefault;
