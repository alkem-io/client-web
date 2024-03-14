import WrapperMarkdown, { MarkdownProps } from './WrapperMarkdown';
import React from 'react';
import { gutters } from '../grid/utils';
import OverflowGradient, { OverflowGradientProps } from '../overflow/OverflowGradient';
import { DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS } from '../card/CardDescription';

interface CroppedMarkdownProps extends MarkdownProps {
  children: string;
  backgroundColor?: OverflowGradientProps['backgroundColor'];
  heightGutters?: number;
}

const CroppedMarkdown = ({
  children,
  heightGutters = DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS,
  backgroundColor = 'default',
  ...props
}: CroppedMarkdownProps) => {
  return (
    <OverflowGradient height={gutters(heightGutters)} backgroundColor={backgroundColor}>
      <WrapperMarkdown card {...props}>
        {children}
      </WrapperMarkdown>
    </OverflowGradient>
  );
};

export default CroppedMarkdown;
