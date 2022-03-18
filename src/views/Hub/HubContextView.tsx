import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import ApplicationButton from '../../components/composite/common/ApplicationButton/ApplicationButton';
import ContextSection from '../../components/composite/sections/ContextSection';
import ApplicationButtonContainer from '../../containers/application/ApplicationButtonContainer';
import {
  AspectCardFragment,
  Context,
  ContextTabFragment,
  ReferenceContextTabFragment,
  Tagset,
} from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';
import { getVisualBanner } from '../../utils/visuals.utils';

interface HubContextEntities {
  context?: ContextTabFragment;
  hubId?: string;
  hubNameId?: string;
  hubDisplayName?: string;
  hubTagSet?: Tagset;
  aspects?: AspectCardFragment[];
  references?: ReferenceContextTabFragment[];
}
interface HubContextActions {}
interface HubContextState {
  loading: boolean;
  error?: ApolloError;
}
interface HubContextOptions {
  canReadAspects: boolean;
  canCreateAspects: boolean;
}

interface HubContextViewProps
  extends ViewProps<HubContextEntities, HubContextActions, HubContextState, HubContextOptions> {}

export const HubContextView: FC<HubContextViewProps> = ({ entities, state, options }) => {
  const { canReadAspects, canCreateAspects } = options;
  const { loading } = state;
  const { context, hubId, hubNameId, hubDisplayName, hubTagSet } = entities;

  const {
    tagline = '',
    impact = '',
    background = '',
    vision = '',
    who = '',
    visuals = [],
    id = '',
  } = context || ({} as Context);
  const hubBanner = getVisualBanner(visuals);
  const references = entities?.references;

  return (
    <ContextSection
      primaryAction={
        hubId && hubNameId && hubDisplayName ? (
          <ApplicationButtonContainer>
            {(e, s) => <ApplicationButton {...e?.applicationButtonProps} loading={s.loading} />}
          </ApplicationButtonContainer>
        ) : undefined
      }
      banner={hubBanner}
      background={background}
      displayName={hubDisplayName}
      keywords={hubTagSet?.tags}
      impact={impact}
      tagline={tagline}
      vision={vision}
      who={who}
      contextId={id}
      references={references}
      aspectsLoading={loading}
      canReadAspects={canReadAspects}
      canCreateAspects={canCreateAspects}
    />
  );
};
export default HubContextView;
