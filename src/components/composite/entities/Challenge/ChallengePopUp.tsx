import React, { FC, useMemo } from 'react';
import { ChallengeSearchResultFragment } from '../../../../models/graphql-schema';
import { buildChallengeUrl } from '../../../../utils/urlBuilders';
import PopUp, { PopUpViewmodel } from '../../search/PopUp';
import PopUpProps from '../../dialogs/PopUpProps';
import { getVisualAvatar } from '../../../../utils/visuals.utils';

const ChallengePopUp: FC<PopUpProps<ChallengeSearchResultFragment>> = ({ onHide, entity: challenge, hub }) => {
  const url = useMemo(
    () => (hub && challenge ? buildChallengeUrl(hub.nameID, challenge.nameID) : ''),
    [hub, challenge]
  );

  const model = useMemo(
    () =>
      ({
        avatar: getVisualAvatar(challenge?.context?.visuals),
        displayName: challenge?.displayName,
        tagline: challenge?.context?.tagline,
        tags: challenge?.tagset?.tags,
        hubName: hub?.displayName,
        url: url,
      } as PopUpViewmodel),
    [hub, challenge]
  );

  return <PopUp onHide={() => onHide && onHide()} model={model} />;
};

export default ChallengePopUp;
