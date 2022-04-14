import React, { FC } from 'react';
import DashboardGenericSection, { DashboardGenericSectionProps } from '../../common/sections/DashboardGenericSection';

type ContextSectionSectionSize = 'medium' | 'large';

interface ContextSectionSectionProps extends DashboardGenericSectionProps {
  size?: ContextSectionSectionSize;
  collapsible?: boolean;
}

const maxHeightPerSize: Record<ContextSectionSectionSize, number> = {
  medium: 192,
  large: 240,
};

const EMPTY = {};

const DashboardSection: FC<ContextSectionSectionProps> = ({
  size = 'medium',
  collapsible = false,
  ...genericSectionProps
}) => {
  const maxHeight = maxHeightPerSize[size];

  return (
    <DashboardGenericSection
      headerSpacing="none"
      options={collapsible ? { collapsible: { maxHeight } } : EMPTY}
      {...genericSectionProps}
    />
  );
};

export default DashboardSection;
