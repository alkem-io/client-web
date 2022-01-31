import React, { FC } from 'react';
import { Visual } from '../../models/graphql-schema';
import VisualUpload from '../../components/composite/common/VisualUpload/VisualUpload';
import { getVisualByType } from '../../utils/visuals.utils';
import { VisualName } from '../../models/constants/visuals.constants';

export interface EditVisualsViewProps {
  visuals?: Visual[];
}

const EditVisualsView: FC<EditVisualsViewProps> = ({ visuals }) => {
  const banner = getVisualByType(VisualName.BANNER, visuals);
  const bannerNarrow = getVisualByType(VisualName.BANNERNARROW, visuals);

  return (
    <>
      <VisualUpload visual={banner} />
      <VisualUpload visual={bannerNarrow} />
    </>
  );
};
export default EditVisualsView;
