import { ApolloError } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  useMintMcpApiKeyMutation,
  useMyMcpApiKeysQuery,
  useRevokeMcpApiKeyMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { McpApiKeyOperation, McpApiKeyStatus } from '@/core/apollo/generated/graphql-schema';
import type { McpApiKeyCreateInput } from '@/crd/components/user/settings/McpApiKeyCreateDialog';
import type {
  McpApiKeyOperationOption,
  McpApiKeyRevealData,
  McpApiKeyRowData,
  McpApiKeyStatusOption,
} from '@/crd/components/user/settings/McpApiKeys.types';

const NS = 'crd-contributorSettings';

const OPERATION_TO_GRAPHQL: Record<McpApiKeyOperationOption, McpApiKeyOperation> = {
  read: McpApiKeyOperation.Read,
  tools: McpApiKeyOperation.Tools,
};

const OPERATION_FROM_GRAPHQL: Record<McpApiKeyOperation, McpApiKeyOperationOption> = {
  [McpApiKeyOperation.Read]: 'read',
  [McpApiKeyOperation.Tools]: 'tools',
};

const STATUS_FROM_GRAPHQL: Record<McpApiKeyStatus, McpApiKeyStatusOption> = {
  [McpApiKeyStatus.Active]: 'active',
  [McpApiKeyStatus.Expired]: 'expired',
  [McpApiKeyStatus.Revoked]: 'revoked',
};

type GraphQLMcpApiKey = {
  id: string;
  name: string;
  operations: McpApiKeyOperation[];
  createdDate: Date;
  expiresAt?: Date;
  lastUsedAt?: Date;
  lastUsedFromIp?: string;
  status: McpApiKeyStatus;
};

const mapKey = (key: GraphQLMcpApiKey): McpApiKeyRowData => ({
  id: key.id,
  name: key.name,
  operations: key.operations.map(op => OPERATION_FROM_GRAPHQL[op]),
  createdDate: key.createdDate,
  expiresAt: key.expiresAt,
  lastUsedAt: key.lastUsedAt,
  lastUsedFromIp: key.lastUsedFromIp,
  status: STATUS_FROM_GRAPHQL[key.status],
});

export type UseMcpApiKeysResult = {
  loading: boolean;
  keys: McpApiKeyRowData[];
  createDialogOpen: boolean;
  openCreateDialog: () => void;
  closeCreateDialog: () => void;
  creating: boolean;
  createError: string | undefined;
  createKey: (input: McpApiKeyCreateInput) => Promise<void>;
  revealData: McpApiKeyRevealData | undefined;
  closeReveal: () => void;
  onRevealCopied: () => void;
  revokingId: string | undefined;
  interruptedRevealKeyId: string | undefined;
  revokeKey: (key: McpApiKeyRowData) => Promise<void>;
};

/**
 * Container hook for the MCP API Keys card (038). Wraps MyMcpApiKeys,
 * MintMcpApiKey and RevokeMcpApiKey. The mint mutation uses
 * `fetchPolicy: 'no-cache'` so the plaintext returned by `mintMcpApiKey`
 * never enters the Apollo cache (FR-026) — it lives only in this hook's
 * local `revealData` state, which is cleared on close (`closeReveal`) and
 * whenever the component unmounts (React discards the state automatically).
 * The list refetches after mint and revoke so metadata stays current.
 */
export function useMcpApiKeys(): UseMcpApiKeysResult {
  const { t } = useTranslation(NS);
  const { data, loading, refetch } = useMyMcpApiKeysQuery();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createError, setCreateError] = useState<string | undefined>(undefined);
  const [revealData, setRevealData] = useState<McpApiKeyRevealData | undefined>(undefined);
  const [revealCopied, setRevealCopied] = useState(false);
  const [revokingId, setRevokingId] = useState<string | undefined>(undefined);
  const [interruptedRevealKeyId, setInterruptedRevealKeyId] = useState<string | undefined>(undefined);

  const [mintMutation, { loading: creating }] = useMintMcpApiKeyMutation({ fetchPolicy: 'no-cache' });
  const [revokeMutation] = useRevokeMcpApiKeyMutation();

  const keys = (data?.me.mcpApiKeys ?? []).map(mapKey);

  const openCreateDialog = () => {
    setCreateError(undefined);
    setCreateDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setCreateDialogOpen(false);
    setCreateError(undefined);
  };

  const createKey = async (input: McpApiKeyCreateInput) => {
    setCreateError(undefined);
    try {
      const result = await mintMutation({
        variables: {
          mintData: {
            name: input.name,
            operations: input.operations.map(op => OPERATION_TO_GRAPHQL[op]),
            expiresAt: input.expiresAt,
          },
        },
      });
      const mintResult = result.data?.mintMcpApiKey;
      if (!mintResult) {
        setCreateError(t('user.security.mcpApiKeys.create.genericError'));
        return;
      }
      setCreateDialogOpen(false);
      setRevealCopied(false);
      setRevealData({ apiKey: mintResult.apiKey, key: mapKey(mintResult.key) });
      await refetch();
    } catch (err) {
      setCreateError(err instanceof ApolloError ? err.message : t('user.security.mcpApiKeys.create.genericError'));
    }
  };

  const onRevealCopied = () => {
    setRevealCopied(true);
  };

  const closeReveal = () => {
    // Interrupted-reveal edge case: the panel was dismissed before the value
    // was copied — the card offers revoke-and-recreate for this key.
    if (revealData && !revealCopied) {
      setInterruptedRevealKeyId(revealData.key.id);
    }
    setRevealData(undefined);
  };

  const revokeKey = async (key: McpApiKeyRowData) => {
    setRevokingId(key.id);
    try {
      await revokeMutation({ variables: { revokeData: { keyID: key.id } } });
      if (interruptedRevealKeyId === key.id) setInterruptedRevealKeyId(undefined);
      await refetch();
      toast.success(t('user.security.mcpApiKeys.revoke.success', { name: key.name }));
    } catch {
      toast.error(t('user.security.mcpApiKeys.revoke.error'));
    } finally {
      setRevokingId(undefined);
    }
  };

  return {
    loading,
    keys,
    createDialogOpen,
    openCreateDialog,
    closeCreateDialog,
    creating,
    createError,
    createKey,
    revealData,
    closeReveal,
    onRevealCopied,
    revokingId,
    interruptedRevealKeyId,
    revokeKey,
  };
}

export default useMcpApiKeys;
