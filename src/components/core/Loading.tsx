import React, { FC } from 'react';

interface LoadingProps {
  text?: string;
}

export const Loading: FC<LoadingProps> = ({ text = 'Loading...' }) => {
  return <div>{text}</div>;
};
export default Loading;
