import { AgentBeginVerifiedCredentialOfferOutput } from '@/core/apollo/generated/graphql-schema';
import TranslationKey from '@/core/i18n/utils/TranslationKey';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import Loading from '@/core/ui/loading/Loading';
import QRCode from '@/core/ui/qrCode/QRCode';
import useContributionProvider, {
  ContributionDetails,
} from '@/domain/community/profile/useContributionProvider/useContributionProvider';
import { SpaceHostedItem } from '@/domain/journey/utils/SpaceHostedItem';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  List,
  ListItemButton,
  ListItemText,
  Slide,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface OfferAlkemioCommunityCredentialDialogProps {
  entities: {
    titleId?: TranslationKey;
    title?: string | React.ReactNode;
    contentId?: TranslationKey;
    content?: string;
    contributions: SpaceHostedItem[];
  };
  actions: {
    onCancel: () => void;
    onConfirm?: () => void;
    onGenerate: (communityID: string) => Promise<AgentBeginVerifiedCredentialOfferOutput>;
  };
  options: {
    show: boolean;
  };
  state?: {
    isLoadingContributions: boolean;
    isLoadingToken: boolean;
  };
}

const OfferAlkemioCommunityCredentialDialog = ({
  entities,
  actions,
  options,
  state,
}: OfferAlkemioCommunityCredentialDialogProps) => {
  const { t } = useTranslation();
  const { contributions } = entities;

  const containerRef = useRef(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState<ContributionDetails>();
  const [token, setToken] = useState<AgentBeginVerifiedCredentialOfferOutput>();

  const title = entities.titleId ? t(entities.titleId) : entities.title;
  if (!title) {
    throw new Error('The credential offer dialog needs a title provided');
  }
  const content = entities.contentId ? t(entities.contentId) : entities.content;
  if (!content) {
    throw new Error('The credential offer dialog needs text content provided');
  }
  const handleClose = () => {
    setSelectedContribution(undefined);
    setToken(undefined);
    actions.onCancel();
  };

  return (
    <Dialog open={options.show} aria-labelledby="confirmation-dialog">
      <DialogHeader onClose={handleClose} title={String(title)} />
      <DialogContent ref={containerRef} sx={{ minHeight: 400, overflow: 'hidden' }}>
        <Slide direction="right" unmountOnExit in={!Boolean(token) && !loadingToken} container={containerRef.current}>
          <Box>
            <DialogContentText>
              <>{content}</>
            </DialogContentText>
            {state?.isLoadingContributions && <Loading text="Loading contributions" />}
            {!state?.isLoadingContributions && contributions && (
              <List disablePadding>
                {contributions.map((c, i) => (
                  <ContributionListItem
                    key={i}
                    contribution={c}
                    selectedContribution={selectedContribution}
                    setSelectedContribution={setSelectedContribution}
                  />
                ))}
              </List>
            )}
          </Box>
        </Slide>
        <Slide direction="left" unmountOnExit in={Boolean(token) || loadingToken} container={containerRef.current}>
          <Box>
            <DialogContentText>
              Scan the QR code to share the credential with your cloud hosted wallet
            </DialogContentText>
            {loadingToken && <Loading text="Generating credential request" />}
            {!loadingToken && token?.jwt && <QRCode qrCodeJwt={token?.jwt} />}
          </Box>
        </Slide>
      </DialogContent>
      <DialogActions>
        {token && (
          <Button
            onClick={async () => {
              setSelectedContribution(undefined);
              setToken(undefined);
            }}
          >
            Back
          </Button>
        )}
        <Button
          onClick={async () => {
            if (selectedContribution && selectedContribution.roleSetId) {
              setLoadingToken(true);
              const result = await actions.onGenerate(selectedContribution.roleSetId);
              setToken(result);
              setLoadingToken(false);
            }
          }}
          disabled={!Boolean(selectedContribution) || Boolean(token) || state?.isLoadingToken}
        >
          Generate QR Code
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ContributionListItem = ({ contribution, selectedContribution, setSelectedContribution }) => {
  const { details } = useContributionProvider({ spaceHostedItem: contribution });

  return (
    <ListItemButton onClick={() => setSelectedContribution(details)} selected={details === selectedContribution}>
      <ListItemText primary={details?.about.profile.displayName} secondary={details?.about.profile.tagline} />
    </ListItemButton>
  );
};

export default OfferAlkemioCommunityCredentialDialog;
