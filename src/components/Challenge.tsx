import React, { FC } from 'react';
import { useParams } from 'react-router-dom';

export const Challenge: FC = () => {
  const { id } = useParams<{ id: string }>();
  return <div>Challenge ID: {id}</div>;
};
