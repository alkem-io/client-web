import { Box, styled } from '@mui/material';
import type { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import CardHeader from '@/core/ui/card/CardHeader';
import ContributeCard from '@/core/ui/card/ContributeCard';
import { Caption } from '@/core/ui/typography';
import { formatDate } from '@/core/utils/time/utils';
import { LocationStateKeyCachedCallout } from '@/domain/collaboration/CalloutPage/CalloutPage';
import { getCollaboraDocumentIcon } from '@/domain/collaboration/calloutContributions/collaboraDocument/collaboraDocumentIcons';
import type { CalloutContributionCardComponentProps } from '../interfaces/CalloutContributionCardComponentProps';

const DocumentDefaultImageWrapper = styled(Box)({
  aspectRatio: '23/12',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '& > svg': {
    fontSize: '3em',
  },
});

const CollaboraDocumentCard = ({
  contribution,
  columns,
  callout,
  onClick,
  selected,
}: CalloutContributionCardComponentProps) => {
  const collaboraDocument = contribution?.collaboraDocument;

  const linkState = {
    [LocationStateKeyCachedCallout]: callout,
    keepScroll: true,
  };

  const docType = collaboraDocument?.documentType as CollaboraDocumentType | undefined;
  const DocumentIcon = docType ? getCollaboraDocumentIcon(docType) : null;

  return (
    <ContributeCard to={collaboraDocument?.profile?.url} onClick={onClick} state={linkState} columns={columns}>
      <CardHeader
        title={collaboraDocument?.profile?.displayName}
        contrast={selected}
        author={collaboraDocument?.createdBy}
      >
        {collaboraDocument?.createdDate && (
          <Caption color="textPrimary">{formatDate(collaboraDocument.createdDate)}</Caption>
        )}
      </CardHeader>
      <DocumentDefaultImageWrapper>
        {DocumentIcon && <DocumentIcon color="primary" fontSize="large" />}
      </DocumentDefaultImageWrapper>
    </ContributeCard>
  );
};

export default CollaboraDocumentCard;
