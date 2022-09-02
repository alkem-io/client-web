import React, { FC, useMemo } from 'react';
import { OpportunitySearchResultFragment } from '../../../../../models/graphql-schema';
import PopUp, { PopUpViewmodel } from '../../search/PopUp';
import { buildOpportunityUrl } from '../../../../utils/urlBuilders';
import PopUpProps from '../../dialogs/PopUpProps';
import { getVisualAvatar } from '../../../../utils/visuals.utils';

const OpportunityPopUp: FC<PopUpProps<OpportunitySearchResultFragment>> = ({ onHide, entity: opportunity, hub }) => {
  const challenge = opportunity.challenge;

  const url = useMemo(
    () =>
      hub && challenge && opportunity ? buildOpportunityUrl(hub?.nameID, challenge?.nameID, opportunity?.nameID) : '',
    [hub, challenge, opportunity]
  );

  const model = useMemo(
    () =>
      ({
        avatar: getVisualAvatar(opportunity?.context?.visuals),
        displayName: opportunity?.displayName,
        tagline: opportunity?.context?.tagline,
        tags: opportunity?.tagset?.tags,
        challengeName: opportunity.challenge?.displayName,
        hubName: hub?.displayName,
        url: url,
      } as PopUpViewmodel),
    [hub, opportunity]
  );

  return <PopUp onHide={() => onHide && onHide()} model={model} />;
};

export default OpportunityPopUp;
