import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ConversationList } from "./ConversationList";
import { ChatView } from "./ChatView";
import { NewConversationFlow } from "./NewConversationFlow";
import { CONVERSATIONS, type Conversation } from "./messagingData";
import { useMessagingHub } from "@/app/contexts/MessagingHubContext";

type HubView = "list" | "chat" | "new";

interface MessagingHubProps {
  open: boolean;
  onClose: () => void;
}

export function MessagingHub({ open, onClose }: MessagingHubProps) {
  const [view, setView] = useState<HubView>("list");
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const messagingHub = useMessagingHub();

  const handleSelectConversation = useCallback(
    (conv: Conversation) => {
      setActiveConversation(conv);
      setView("chat");
    },
    []
  );

  const handleBack = useCallback(() => {
    setView("list");
    setActiveConversation(null);
  }, []);

  const handleNewMessage = useCallback(() => {
    setView("new");
  }, []);

  const handleNewConversationOpen = useCallback(
    (conv: Conversation) => {
      handleSelectConversation(conv);
    },
    [handleSelectConversation]
  );

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Reset to list view when the hub is closed
  useEffect(() => {
    if (!open) {
      setView("list");
      setActiveConversation(null);
      setSearchQuery("");
    }
  }, [open]);

  // Auto-open a specific conversation when triggered from the ChatRail
  useEffect(() => {
    if (open && messagingHub.initialConversationId) {
      const conv = CONVERSATIONS.find(
        (c) => c.id === messagingHub.initialConversationId
      );
      if (conv) {
        handleSelectConversation(conv);
      }
      messagingHub.clearInitialConversation();
    }
  }, [open, messagingHub.initialConversationId, handleSelectConversation, messagingHub]);

  const totalUnread = CONVERSATIONS.reduce((s, c) => s + c.unread, 0);

  const handleVisitSpace = useCallback(() => {
    if (activeConversation?.type === "space" && activeConversation.spaceSlug) {
      navigate(`/space/${activeConversation.spaceSlug}`);
      onClose();
    }
  }, [activeConversation, navigate, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] md:pointer-events-none"
            style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)" }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed z-[61] flex flex-col top-0 right-0"
            style={{
              width: "min(380px, 100vw)",
              height: "100dvh",
              background: "var(--background)",
              borderLeft: "1px solid var(--border)",
              boxShadow: "var(--elevation-sm)",
              fontFamily: "'Inter', sans-serif",
            }}
            role="dialog"
            aria-label="Messaging Hub"
          >
            {/* Panel Header */}
            <div
              className="flex items-center justify-between shrink-0"
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid var(--border)",
                background: "var(--card)",
              }}
            >
              <div className="flex items-center gap-2">
                <h2
                  style={{
                    fontSize: "var(--text-base)",
                    fontWeight: 600,
                    color: "var(--foreground)",
                    margin: 0,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Messages
                </h2>
                {totalUnread > 0 && view === "list" && (
                  <span
                    className="rounded-full flex items-center justify-center"
                    style={{
                      minWidth: 20,
                      height: 20,
                      padding: "0 5px",
                      fontSize: "11px",
                      fontWeight: 700,
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {totalUnread}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {view === "list" && (
                  <button
                    onClick={handleNewMessage}
                    className="p-1.5 rounded-md transition-colors"
                    style={{ color: "var(--foreground)" }}
                    title="New Message"
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--accent)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <Plus style={{ width: 18, height: 18 }} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-md transition-colors"
                  style={{ color: "var(--muted-foreground)" }}
                  title="Close"
                  aria-label="Close messages"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--accent)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <X style={{ width: 18, height: 18 }} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {view === "list" && (
                <div
                  className="flex-1 flex flex-col overflow-hidden"
                  style={{ paddingTop: 12 }}
                >
                  <ConversationList
                    conversations={CONVERSATIONS}
                    onSelect={handleSelectConversation}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                  />
                </div>
              )}

              {view === "chat" && activeConversation && (
                <ChatView
                  conversation={activeConversation}
                  onBack={handleBack}
                />
              )}

              {view === "new" && (
                <NewConversationFlow
                  onBack={handleBack}
                  onOpenConversation={handleNewConversationOpen}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}