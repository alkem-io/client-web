import React from 'react';

export default class LinesFitterErrorBoundary extends React.Component<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  { hasError: boolean }
> {
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
      return <div {...wrapperProps} />;
    }

    return this.props.children;
  }
}
