import * as React from 'react';
import { useChallengeProfileQuery } from '../../generated/graphql';
import ChallengeProfile from './ChallengeProfile';

interface OwnProps {
  id: number;
}

const ChallengeProfileContainer = ({ id }: OwnProps) => {
  const { data, error, loading, refetch } = useChallengeProfileQuery({
    variables: { id: String(id) },
  });
  React.useEffect(() => {
    refetch();
  }, [id, refetch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>ERROR {error.message}</div>;
  }

  if (!data) {
    return <div>Select a challenge from the panel</div>;
  }

  return <ChallengeProfile data={data} />;
};

export default ChallengeProfileContainer;
