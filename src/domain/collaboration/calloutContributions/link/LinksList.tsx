import { Identifiable } from '@/core/utils/Identifiable';
import { LinkDetails } from './models/LinkDetails';
import GuttersGrid from '@/core/ui/grid/GuttersGrid';
import ReferenceView from '@/domain/shared/components/References/ReferenceView';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

interface LinkContributionsListProps {
  contributions: (Identifiable & {
    sortOrder: number;
    link?: LinkDetails & Identifiable & { authorization?: { myPrivileges?: AuthorizationPrivilege[] } };
  })[];
  onEditContribution?: (contribution: Identifiable) => void;
  loading?: boolean;
}

const LinkContributionsList = ({ contributions, onEditContribution }: LinkContributionsListProps) => {
  return (
    <GuttersGrid>
      {contributions.map(
        contribution =>
          contribution.link && (
            <ReferenceView
              key={contribution.link.id}
              reference={{
                id: contribution.link?.id,
                name: contribution.link?.profile.displayName,
                description: contribution.link?.profile.description,
                uri: contribution.link?.uri,
              }}
              canEdit={contribution.link.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update)}
              onClickEdit={onEditContribution ? () => onEditContribution(contribution) : undefined}
              flex="0 1 50%"
            />
          )
      )}
      links
    </GuttersGrid>
  );
};

export default LinkContributionsList;
