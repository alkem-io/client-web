import { LinkContribution } from './models/LinkContribution';
import GuttersGrid from '@/core/ui/grid/GuttersGrid';
import ReferenceView, { ReferenceViewSkeleton } from '@/domain/shared/components/References/ReferenceView';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { times } from 'lodash';

interface LinkContributionsListProps {
  contributions: LinkContribution[];
  onEditContribution?: (contribution: LinkContribution) => void;
  expanded?: boolean;
  loading?: boolean;
}

const LinkContributionsList = ({
  contributions,
  onEditContribution,
  expanded,
  loading,
}: LinkContributionsListProps) => {
  return (
    <GuttersGrid>
      {loading && times(4, index => <ReferenceViewSkeleton key={index} />)}
      {contributions.map(
        contribution =>
          contribution.link && (
            <ReferenceView
              key={contribution.id}
              reference={{
                id: contribution.link.id,
                name: contribution.link.profile.displayName,
                description: contribution.link.profile.description,
                uri: contribution.link.uri,
              }}
              canEdit={contribution.link.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update)}
              onClickEdit={onEditContribution ? () => onEditContribution(contribution) : undefined}
              expandDescription={expanded}
            />
          )
      )}
    </GuttersGrid>
  );
};

export default LinkContributionsList;
