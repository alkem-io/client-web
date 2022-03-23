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
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AgentBeginVerifiedCredentialRequestOutput, CredentialMetadataOutput } from '../../../../models/graphql-schema';
import TranslationKey from '../../../../types/TranslationKey';
import { Loading } from '../../../core';
import { DialogContent, DialogTitle } from '../../../core/dialog';
import QRCode from '../../../core/QRCode/QRCode';

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

const RequestCredentialDialog: FC<RequestCredentialDialogProps> = ({ entities, actions, options, state }) => {
  const { t } = useTranslation();
  const { credentialMetadata } = entities;

  const containerRef = useRef(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [selectedCredentialMetadata, setSelectedCredentialMetadata] = useState<CredentialMetadataOutput>();
  const [token, setToken] = useState<AgentBeginVerifiedCredentialRequestOutput>();

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
    setToken(undefined);
  }, [options.show]);

  return (
    <Dialog open={options.show} aria-labelledby="confirmation-dialog">
      <DialogTitle
        id="credential-request-dialog-title"
        onClose={() => {
          setSelectedCredentialMetadata(undefined);
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
        <Slide direction="left" unmountOnExit in={Boolean(token) || loadingToken} container={containerRef.current}>
          <Box>
            <DialogContentText>
              Scan the QR code to share the credential with your cloud hosted wallet
            </DialogContentText>
            {loadingToken && <Loading text="Generating credential request" />}
            {!loadingToken && token?.jwt && <QRCode value={token?.jwt} />}
          </Box>
        </Slide>
      </DialogContent>
      <DialogActions>
        {token && (
          <Button
            onClick={async () => {
              setSelectedCredentialMetadata(undefined);
              setToken(undefined);
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
              setToken(result);
              setLoadingToken(false);
            }
          }}
          disabled={!Boolean(selectedCredentialMetadata) || Boolean(token) || state?.isLoadingToken}
        >
          Generate QR Code
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestCredentialDialog;
