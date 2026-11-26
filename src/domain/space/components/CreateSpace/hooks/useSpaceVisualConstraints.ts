import { useCreateSpaceVisualConstraintsQuery } from '@/core/apollo/generated-v2/apollo-hooks';
import type { VisualConstraints } from '@/domain/common/visual/model/VisualModel';
import type { SpaceVisualRole } from './useUploadVisualsOnCreate/useUploadVisualsOnCreate';

/** The crop constraints of a space's root visuals, from the platform's declared visual_constraints (Config). */
export const useSpaceVisualConstraints = ({ skip }: { skip: boolean }) => {
  const { data } = useCreateSpaceVisualConstraintsQuery({ skip });
  const constraintsFor = (role: SpaceVisualRole): VisualConstraints | null => {
    const found = data?.config.visualConstraints.find(constraint => constraint.name === role);
    if (!found) return null;
    const { name: _name, __typename: _typename, ...constraints } = found;
    return constraints;
  };
  return { constraintsFor };
};
