import { Maximize2, Share2, Save } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/crd/primitives/button';
import { WhiteboardCollabFooter } from '@/crd/components/whiteboard/WhiteboardCollabFooter';
import { WhiteboardDisplayName } from '@/crd/components/whiteboard/WhiteboardDisplayName';
import { WhiteboardEditorShell } from '@/crd/components/whiteboard/WhiteboardEditorShell';
import { WhiteboardSaveFooter } from '@/crd/components/whiteboard/WhiteboardSaveFooter';
import { JoinWhiteboardDialog } from '@/crd/components/whiteboard/JoinWhiteboardDialog';
import { WhiteboardErrorState } from '@/crd/components/whiteboard/WhiteboardErrorState';

/**
 * Demo page for whiteboard CRD components.
 * Uses a placeholder grid instead of Excalidraw to keep the demo app lightweight.
 */
export function WhiteboardPage() {
  const [shellOpen, setShellOpen] = useState(false);
  const [singleUserOpen, setSingleUserOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestTouched, setGuestTouched] = useState(false);

  const guestError = guestTouched && guestName.trim().length === 0 ? 'Name is required' : undefined;

  const handleJoinSubmit = () => {
    setGuestTouched(true);
    if (guestName.trim().length === 0) return;
    alert(`Joining as: ${guestName.trim()}`);
    setJoinOpen(false);
    setGuestName('');
    setGuestTouched(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8">
      <h1 className="text-page-title">Whiteboard Components</h1>

      <section className="space-y-4">
        <h2 className="text-subsection-title">Dialogs</h2>
        <div className="flex gap-3">
          <Button onClick={() => setShellOpen(true)}>Open Multi-User Editor</Button>
          <Button variant="outline" onClick={() => setSingleUserOpen(true)}>Open Single-User Editor</Button>
          <Button variant="outline" onClick={() => setJoinOpen(true)}>Open Join Dialog</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-subsection-title">Error State</h2>
        <div className="border rounded-lg overflow-hidden min-h-[300px] relative">
          <WhiteboardErrorState
            title="Whiteboard Not Found"
            message="This whiteboard doesn't exist or is no longer available."
            onRetry={() => alert('Retry clicked')}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-subsection-title">Footer Variants</h2>
        <div className="border rounded-lg overflow-hidden">
          <p className="px-4 py-2 text-body text-muted-foreground">Multi-user (collaborative):</p>
          <WhiteboardCollabFooter
            canDelete={true}
            onDelete={() => {}}
            readonlyMessage="Read-only mode — you were inactive for 60 seconds"
            canRestart={true}
            onRestart={() => {}}
            guestWarningVisible={true}
          />
        </div>
        <div className="border rounded-lg overflow-hidden">
          <p className="px-4 py-2 text-body text-muted-foreground">Single-user (save mode):</p>
          <WhiteboardSaveFooter
            onDelete={() => {}}
            onSave={() => {}}
          />
        </div>
      </section>

      {/* Multi-user editor shell */}
      <WhiteboardEditorShell
        open={shellOpen}
        fullscreen={true}
        onClose={() => setShellOpen(false)}
        title={<WhiteboardDisplayName displayName="Design Workshop" readOnly={true} />}
        headerActions={
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8">
              <Share2 className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8">
              <Maximize2 className="size-4" />
            </Button>
            <div className="size-2 rounded-full bg-green-500 mx-1" title="Saved" />
          </div>
        }
        footer={
          <WhiteboardCollabFooter
            canDelete={true}
            onDelete={() => {}}
            readonlyMessage="Collaborative editing active — 3 users connected"
            guestWarningVisible={true}
          />
        }
      >
        {/* Placeholder for Excalidraw canvas — static grid pattern */}
        <div className="w-full h-full bg-white flex items-center justify-center" style={{ backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          <div className="text-center text-muted-foreground">
            <p className="text-subsection-title">Excalidraw Canvas Area</p>
            <p className="text-body">In the real app, the Excalidraw editor renders here</p>
          </div>
        </div>
      </WhiteboardEditorShell>

      {/* Single-user editor shell */}
      <WhiteboardEditorShell
        open={singleUserOpen}
        fullscreen={true}
        onClose={() => setSingleUserOpen(false)}
        title={<WhiteboardDisplayName displayName="Callout Whiteboard" readOnly={true} />}
        footer={
          <WhiteboardSaveFooter
            onDelete={() => setSingleUserOpen(false)}
            onSave={() => alert('Save clicked')}
          />
        }
      >
        <div className="w-full h-full bg-white flex items-center justify-center" style={{ backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          <div className="text-center text-muted-foreground">
            <p className="text-subsection-title">Single-User Excalidraw Canvas</p>
            <p className="text-body">No real-time collaboration — explicit Save required</p>
          </div>
        </div>
      </WhiteboardEditorShell>

      {/* Join dialog */}
      <JoinWhiteboardDialog
        open={joinOpen}
        value={guestName}
        error={guestError}
        touched={guestTouched}
        onChange={setGuestName}
        onBlur={() => setGuestTouched(true)}
        onSubmit={handleJoinSubmit}
        onSignIn={() => alert('Sign in clicked')}
      />
    </div>
  );
}
