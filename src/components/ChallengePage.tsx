import React, { FC, useContext } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { appContext } from '../context/AppProvider';
import ChallengeProfileContainer from './ChallengeProfile';

export const ChallengePage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const context = useContext(appContext);
  const resolvedId = context.challenges.find(x => x.textID === id)?.id;

  if (!resolvedId) return <Redirect to="/404" />;

  return (
    <>
      <ChallengeProfileContainer id={Number(resolvedId)} />
    </>
  );
};
