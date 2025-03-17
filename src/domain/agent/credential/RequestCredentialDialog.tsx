import {
  AgentBeginVerifiedCredentialRequestOutput,
  CredentialMetadataOutput,
} from '@/core/apollo/generated/graphql-schema';
import TranslationKey from '@/core/i18n/utils/TranslationKey';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import Loading from '@/core/ui/loading/Loading';
import QRCode from '@/core/ui/qrCode/QRCode';
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
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface RequestCredentialDialogProps {
  entities: {
    titleId?: TranslationKey;
    title?: string | React.ReactNode;
    contentId?: TranslationKey;
    content?: string;
    credentialMetadata?: CredentialMetadataOutput[];
  };
  actions: {
    onCancel: () => void;
    onConfirm?: () => void;
    onGenerate: (credential: CredentialMetadataOutput) => Promise<AgentBeginVerifiedCredentialRequestOutput>;
  };
  options: {
    show: boolean;
  };
  state?: {
    isLoadingCredentialMetadata: boolean;
    isLoadingToken: boolean;
  };
}

const RequestCredentialDialog = ({ entities, actions, options, state }: RequestCredentialDialogProps) => {
  const { t } = useTranslation();
  const { credentialMetadata } = entities;

  const containerRef = useRef(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [selectedCredentialMetadata, setSelectedCredentialMetadata] = useState<CredentialMetadataOutput>();
  const [vcInteraction, setVcInteraction] = useState<AgentBeginVerifiedCredentialRequestOutput>();

  const title = entities.titleId ? t(entities.titleId) : entities.title;
  if (!title) {
    throw new Error('The credential request dialog needs a title provided');
  }
  const content = entities.contentId ? t(entities.contentId) : entities.content;
  if (!content) {
    throw new Error('The credential request dialog needs text content provided');
  }

  useEffect(() => {
    setSelectedCredentialMetadata(undefined);
    setVcInteraction(undefined);
  }, [options.show]);

  const handleClose = () => {
    setSelectedCredentialMetadata(undefined);
    setVcInteraction(undefined);
    actions.onCancel();
  };

  return (
    <Dialog open={options.show} aria-labelledby="confirmation-dialog" sx={{ '& .MuiPaper-root': { height: '100vh' } }}>
      <DialogHeader title={String(title)} onClose={handleClose} />
      <DialogContent ref={containerRef} sx={{ overflowX: 'hidden', display: 'flex', flexFlow: 'column nowrap' }}>
        <Slide
          direction="right"
          unmountOnExit
          in={!Boolean(vcInteraction) && !loadingToken}
          container={containerRef.current}
        >
          <Box>
            <DialogContentText>
              <>{content}</>
            </DialogContentText>
            {state?.isLoadingCredentialMetadata && <Loading text="Loading credential metadata" />}
            {!state?.isLoadingCredentialMetadata && credentialMetadata && (
              <List disablePadding>
                {credentialMetadata.map(metadata => (
                  <ListItemButton
                    key={metadata.uniqueType}
                    onClick={() => setSelectedCredentialMetadata(metadata)}
                    selected={metadata === selectedCredentialMetadata}
                  >
                    <ListItemText primary={metadata.name} secondary={metadata.description} />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>
        </Slide>
        <Slide
          direction="left"
          unmountOnExit
          in={Boolean(vcInteraction) || loadingToken}
          container={containerRef.current}
        >
          <Box sx={{ flexGrow: 1, display: 'flex', flexFlow: 'column nowrap' }}>
            <DialogContentText>
              Scan the QR code to share the credential with your cloud hosted wallet
            </DialogContentText>
            {loadingToken && <Loading text="Generating credential request" />}
            {!loadingToken && (vcInteraction?.jwt || vcInteraction?.qrCodeImg) && (
              <QRCode qrCodeJwt={vcInteraction.jwt} qrCodeImg={vcInteraction.qrCodeImg} sx={{ flexGrow: 1 }} />
            )}
          </Box>
        </Slide>
      </DialogContent>
      <DialogActions>
        {vcInteraction && (
          <Button
            onClick={async () => {
              setSelectedCredentialMetadata(undefined);
              setVcInteraction(undefined);
            }}
          >
            Back
          </Button>
        )}
        <Button
          onClick={async () => {
            if (selectedCredentialMetadata) {
              setLoadingToken(true);
              const result = await actions.onGenerate(selectedCredentialMetadata);
              setVcInteraction(result);
              setLoadingToken(false);
            }
          }}
          disabled={!Boolean(selectedCredentialMetadata) || Boolean(vcInteraction) || state?.isLoadingToken}
        >
          Generate QR Code
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestCredentialDialog;
