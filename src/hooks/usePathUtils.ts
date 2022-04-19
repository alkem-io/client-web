import { useMemo } from 'react';
import { useUpdateNavigation } from './useNavigation';
import { Path } from '../context/NavigationProvider';
import { useResolvedPath } from 'react-router-dom';

interface PathDef {
  value?: string;
  name: string;
}

export const useAppendPaths = (initialPaths: Path[], ...pathDefs: PathDef[]) => {
  const appendedPaths = pathDefs.map(pathDef => ({
    value: '',
    ...pathDef,
    real: !!pathDef.value,
  }));

  return useMemo(() => [...initialPaths, ...appendedPaths], [initialPaths]);
};

export const useAppendPath = (paths: Path[], pathDef: PathDef) => {
  const path = {
    value: '',
    ...pathDef,
    real: !!pathDef.value,
  };
  return useMemo(() => [...paths, path], [paths, pathDef.name, pathDef.value]);
};

export const useAppendBreadcrumb = (paths: Path[], pathDef: PathDef) => {
  const currentPaths = useAppendPath(paths, pathDef);
  useUpdateNavigation({ currentPaths });
  return currentPaths;
};

export const useAppendCurrentPath = (paths: Path[], entryName: string) => {
  const { pathname: url } = useResolvedPath('.');
  return useAppendPath(paths, {
    name: entryName,
    value: url,
  });
};
