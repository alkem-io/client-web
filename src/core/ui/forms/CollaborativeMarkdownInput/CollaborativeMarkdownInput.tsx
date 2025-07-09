import * as Y from 'yjs';
import { forwardRef, useEffect, useState } from 'react';
import { TiptapCollabProvider } from '@hocuspocus/provider';
import MarkdownInput, { MarkdownInputProps, MarkdownInputRefApi } from '@/core/ui/forms/MarkdownInput/MarkdownInput';

export interface CollaborativeMarkdownInputProps extends MarkdownInputProps {
  /**
   * The UUID of the collaboration session.
   * This is used to identify the document in the collaborative environment.
   */
  collaborationUUID: string;
}
// todo: CollaborativeMarkdownInput is initialized twice - one of the connections is left hanging
const CollaborativeMarkdownInput = forwardRef<MarkdownInputRefApi, CollaborativeMarkdownInputProps>(
  ({ collaborationUUID, ...restOfProps }, ref) => {
    // usePersistentValue, useRef do not work here, because the provider needs to be created once per component instance
    // and both of them, used with initValue, are re-initialized on every render.
    const [provider] = useState(() => {
      return new TiptapCollabProvider({
        baseUrl: 'ws://localhost:1234',
        name: collaborationUUID,
        document: new Y.Doc(),
      });
    });

    useEffect(() => {
      return () => {
        provider.destroy();
      };
    }, []);

    return <MarkdownInput ref={ref} provider={provider} {...restOfProps} />;
  }
);

export default CollaborativeMarkdownInput;
