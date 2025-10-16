import { LinkContribution } from './models/LinkContribution';
import GuttersGrid from '@/core/ui/grid/GuttersGrid';
import ReferenceView from '@/domain/shared/components/References/ReferenceView';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

interface LinkContributionsListProps {
  contributions: LinkContribution[];
  onEditContribution?: (contribution: LinkContribution) => void;
  loading?: boolean;
}

const LinkContributionsList = ({ contributions, onEditContribution }: LinkContributionsListProps) => {
  return (
    <GuttersGrid>
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
            />
          )
      )}
    </GuttersGrid>
  );
};

export default LinkContributionsList;
