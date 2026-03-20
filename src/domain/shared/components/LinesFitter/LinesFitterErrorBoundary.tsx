import { Box, type BoxProps } from '@mui/material';
import React from 'react';

export default class LinesFitterErrorBoundary extends React.Component<BoxProps, { hasError: boolean }> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    const { children, ...wrapperProps } = this.props;

    if (this.state.hasError) {
      return <Box {...wrapperProps} />;
    }

    return children;
  }
}
