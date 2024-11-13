import {
  Box,
  Button,
  DialogActions,
  DialogContentText,
  List,
  ListItemButton,
  ListItemText,
  Slide,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import React, { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContributionDetailsContainer, {
  ContributionDetails,
} from '../../community/profile/ContributionDetails/ContributionDetailsContainer';
import { SpaceHostedItem } from '../../journey/utils/SpaceHostedItem';
import { AgentBeginVerifiedCredentialOfferOutput } from '@core/apollo/generated/graphql-schema';
import TranslationKey from '@core/i18n/utils/TranslationKey';
import Loading from '@core/ui/loading/Loading';
import { DialogContent, DialogTitle } from '@core/ui/dialog/deprecated';
import QRCode from '@core/ui/qrCode/QRCode';

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

const OfferAlkemioCommunityCredentialDialog: FC<OfferAlkemioCommunityCredentialDialogProps> = ({
  entities,
  actions,
  options,
  state,
}) => {
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

  return (
    <Dialog open={options.show} aria-labelledby="confirmation-dialog">
      <DialogTitle
        id="credential-offer-dialog-title"
        onClose={() => {
          setSelectedContribution(undefined);
          setToken(undefined);
          actions.onCancel();
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent ref={containerRef} sx={{ minHeight: 400, overflow: 'hidden' }}>
        <Slide direction="right" unmountOnExit in={!Boolean(token) && !loadingToken} container={containerRef.current}>
          <Box>
            <DialogContentText>{content}</DialogContentText>
            {state?.isLoadingContributions && <Loading text="Loading contributions" />}
            {!state?.isLoadingContributions && contributions && (
              <List disablePadding>
                {contributions.map((c, i) => (
                  <ContributionDetailsContainer entities={c} key={i}>
                    {({ details }) => (
                      <ListItemButton
                        onClick={() => setSelectedContribution(details)}
                        selected={details === selectedContribution}
                      >
                        <ListItemText primary={details?.displayName} secondary={details?.tagline} />
                      </ListItemButton>
                    )}
                  </ContributionDetailsContainer>
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

export default OfferAlkemioCommunityCredentialDialog;
