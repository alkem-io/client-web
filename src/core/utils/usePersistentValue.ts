import { useRef } from 'react';

const usePersistentValue = <Value>(value: Value) => useRef<Value>(value).current;

export default usePersistentValue;
