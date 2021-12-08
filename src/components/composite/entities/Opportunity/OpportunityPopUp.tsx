import React, { FC, useMemo } from 'react';
import { OpportunitySearchResultFragment } from '../../../../models/graphql-schema';
import PopUp, { PopUpViewmodel } from '../../search/PopUp';
import { buildOpportunityUrl } from '../../../../utils/urlBuilders';
import PopUpProps from '../../dialogs/PopUpProps';

const OpportunityPopUp: FC<PopUpProps<OpportunitySearchResultFragment>> = ({
  onHide,
  entity: opportunity,
  ecoverse,
}) => {
  const challenge = opportunity.challenge;

  const url = useMemo(
    () =>
      ecoverse && challenge && opportunity
        ? buildOpportunityUrl(ecoverse?.nameID, challenge?.nameID, opportunity?.nameID)
        : '',
    [ecoverse, challenge, opportunity]
  );

  const model = useMemo(
    () =>
      ({
        avatar: opportunity?.context?.visual?.avatar,
        displayName: opportunity?.displayName,
        tagline: opportunity?.context?.tagline,
        tags: opportunity?.tagset?.tags,
        challengeName: opportunity.challenge?.displayName,
        ecoverseName: ecoverse?.displayName,
        url: url,
      } as PopUpViewmodel),
    [ecoverse, opportunity]
  );

  return <PopUp onHide={() => onHide && onHide()} model={model} />;
};

export default OpportunityPopUp;
