import React, { FC, ReactNode } from 'react';
import { Reference } from '../../../../../domain/common/profile/Profile';
import ReferenceView from './Reference';

interface ReferencesProps {
  references: Reference[] | undefined;
  noItemsView?: ReactNode;
}

const References: FC<ReferencesProps> = ({ references, noItemsView }) => {
  return (
    <>
      {!references?.length ? null : references.map((reference, i) => <ReferenceView key={i} reference={reference} />)}
      {references && !references.length && noItemsView}
    </>
  );
};

export default References;
