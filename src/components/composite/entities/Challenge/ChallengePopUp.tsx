import React, { FC, useMemo } from 'react';
import { ChallengeSearchResultFragment } from '../../../../models/graphql-schema';
import { buildChallengeUrl } from '../../../../utils/urlBuilders';
import PopUp, { PopUpViewmodel } from '../../search/PopUp';
import PopUpProps from '../../dialogs/PopUpProps';

const ChallengePopUp: FC<PopUpProps<ChallengeSearchResultFragment>> = ({ onHide, entity: challenge, ecoverse }) => {
  const url = useMemo(
    () => (ecoverse && challenge ? buildChallengeUrl(ecoverse.nameID, challenge.nameID) : ''),
    [ecoverse, challenge]
  );

  const model = useMemo(
    () =>
      ({
        avatar: challenge?.context?.visual?.avatar,
        displayName: challenge?.displayName,
        tagline: challenge?.context?.tagline,
        tags: challenge?.tagset?.tags,
        ecoverseName: ecoverse?.displayName,
        url: url,
      } as PopUpViewmodel),
    [ecoverse, challenge]
  );

  return <PopUp onHide={() => onHide && onHide()} model={model} />;
};

export default ChallengePopUp;
