import { useEffect, useState, useRef } from 'react';
import { UiNode, UiNodeScriptAttributes } from '@ory/kratos-client';
import { isScriptNode } from '../components/Kratos/helpers';

type WebAuthnScriptStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface UseWebAuthnScriptResult {
  status: WebAuthnScriptStatus;
  error: Error | null;
  isReady: boolean;
}

/**
 * Hook to safely load the Ory WebAuthn/Passkey script from Kratos UI nodes.
 * Handles script loading, caching, and error states.
 */
export const useWebAuthnScript = (nodes: UiNode[] | undefined): UseWebAuthnScriptResult => {
  const [status, setStatus] = useState<WebAuthnScriptStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!nodes) return;

    const scriptNode = nodes.find(isScriptNode);
    if (!scriptNode) {
      // No script node means WebAuthn/Passkey is not enabled
      return;
    }

    const attrs = scriptNode.attributes as UiNodeScriptAttributes;

    // Check if script already exists in DOM
    const existingScript = document.getElementById(attrs.id);
    if (existingScript) {
      setStatus('loaded');
      return;
    }

    setStatus('loading');

    const script = document.createElement('script');
    script.id = attrs.id;
    script.src = attrs.src;
    script.async = attrs.async;
    script.type = attrs.type || 'text/javascript';

    // Security attributes
    if (attrs.crossorigin) {
      script.crossOrigin = attrs.crossorigin;
    }
    if (attrs.integrity) {
      script.integrity = attrs.integrity;
    }
    if (attrs.referrerpolicy) {
      script.referrerPolicy = attrs.referrerpolicy as ReferrerPolicy;
    }
    if (attrs.nonce) {
      script.nonce = attrs.nonce;
    }

    script.onload = () => {
      setStatus('loaded');
      setError(null);
    };

    script.onerror = () => {
      setStatus('error');
      setError(new Error(`Failed to load WebAuthn script: ${attrs.src}`));
    };

    document.head.appendChild(script);
    scriptRef.current = script;

    // Cleanup function - we don't remove the script on unmount
    // because it may be needed by other components and is cached
  }, [nodes]);

  return {
    status,
    error,
    isReady: status === 'loaded',
  };
};

export default useWebAuthnScript;
