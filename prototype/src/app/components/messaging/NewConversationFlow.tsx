import { useState, useMemo } from "react";
import { ArrowLeft, X, Search, Check, MessageSquare, Users, Hash } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ALL_USERS, CONVERSATIONS, type UserInfo, type Conversation } from "./messagingData";

type Step = "choose" | "dm-search" | "group-select" | "group-name" | "space-browse";

interface NewConversationFlowProps {
  onBack: () => void;
  onOpenConversation: (conversation: Conversation) => void;
}

export function NewConversationFlow({
  onBack,
  onOpenConversation,
}: NewConversationFlowProps) {
  const [step, setStep] = useState<Step>("choose");
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserInfo[]>([]);
  const [groupName, setGroupName] = useState("");

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return ALL_USERS;
    const q = search.toLowerCase();
    return ALL_USERS.filter((u) => u.name.toLowerCase().includes(q));
  }, [search]);

  const spaceChannels = CONVERSATIONS.filter((c) => c.type === "space");

  const toggleUser = (user: UserInfo) => {
    setSelectedUsers((prev) =>
      prev.find((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    );
  };

  const handleDmSelect = (user: UserInfo) => {
    const existing = CONVERSATIONS.find(
      (c) => c.type === "dm" && c.name === user.name
    );
    if (existing) {
      onOpenConversation(existing);
    }
  };

  const handleCreateGroup = () => {
    // In a real app this would create the group server-side
    // For now just navigate back
    onBack();
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--background)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 shrink-0"
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
          background: "var(--card)",
        }}
      >
        <button
          onClick={
            step === "choose"
              ? onBack
              : () => {
                  setStep("choose");
                  setSearch("");
                  setSelectedUsers([]);
                  setGroupName("");
                }
          }
          className="shrink-0 p-1 rounded-md transition-colors"
          style={{ color: "var(--muted-foreground)" }}
        >
          <ArrowLeft style={{ width: 18, height: 18 }} />
        </button>
        <span
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            color: "var(--foreground)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {step === "choose" && "New Message"}
          {step === "dm-search" && "Direct Message"}
          {step === "group-select" && "New Group"}
          {step === "group-name" && "Name Your Group"}
          {step === "space-browse" && "Space Channels"}
        </span>
      </div>

      {/* ── Step: Choose type ─────────────────────────────────────────── */}
      {step === "choose" && (
        <div style={{ padding: "12px 16px" }} className="flex flex-col gap-1.5">
          {[
            {
              icon: MessageSquare,
              label: "Direct Message",
              desc: "Send a private message to one person",
              action: () => setStep("dm-search"),
            },
            {
              icon: Users,
              label: "New Group",
              desc: "Create a group chat with multiple people",
              action: () => setStep("group-select"),
            },
            {
              icon: Hash,
              label: "Space Channels",
              desc: "Browse your Space channels",
              action: () => setStep("space-browse"),
            },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex items-center gap-3 w-full text-left rounded-lg transition-colors"
              style={{
                padding: "12px 14px",
                border: "1px solid var(--border)",
                background: "var(--card)",
                borderRadius: "var(--radius)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--accent)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--card)")
              }
            >
              <div
                className="shrink-0 flex items-center justify-center rounded-lg"
                style={{
                  width: 36,
                  height: 36,
                  background: "var(--secondary)",
                  color: "var(--foreground)",
                }}
              >
                <item.icon style={{ width: 18, height: 18 }} />
              </div>
              <div className="min-w-0">
                <span
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: 500,
                    color: "var(--foreground)",
                    display: "block",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--muted-foreground)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {item.desc}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Step: DM search ───────────────────────────────────────────── */}
      {step === "dm-search" && (
        <div className="flex flex-col h-full">
          <div style={{ padding: "12px 16px 8px" }}>
            <div
              className="relative flex items-center"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
              }}
            >
              <Search
                className="absolute"
                style={{
                  left: 10,
                  width: 14,
                  height: 14,
                  color: "var(--muted-foreground)",
                }}
              />
              <input
                type="text"
                placeholder="Search people..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full bg-transparent outline-none"
                style={{
                  padding: "8px 12px 8px 32px",
                  fontSize: "var(--text-sm)",
                  color: "var(--foreground)",
                  fontFamily: "'Inter', sans-serif",
                }}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleDmSelect(user)}
                className="w-full flex items-center gap-3 text-left transition-colors"
                style={{ padding: "8px 16px" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--accent)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <Avatar
                  style={{
                    width: 36,
                    height: 36,
                    border: "1px solid var(--border)",
                  }}
                >
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <span
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: 500,
                      color: "var(--foreground)",
                      display: "block",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {user.name}
                  </span>
                  <span
                    className="flex items-center gap-1.5"
                    style={{
                      fontSize: "11px",
                      color: "var(--muted-foreground)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <span
                      className="rounded-full"
                      style={{
                        width: 6,
                        height: 6,
                        background:
                          user.status === "online"
                            ? "var(--success)"
                            : user.status === "busy"
                            ? "var(--destructive)"
                            : "var(--muted-foreground)",
                      }}
                    />
                    {user.status === "online"
                      ? "Online"
                      : user.status === "busy"
                      ? "Busy"
                      : "Offline"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step: Group select users ──────────────────────────────────── */}
      {step === "group-select" && (
        <div className="flex flex-col h-full">
          <div style={{ padding: "12px 16px 8px" }}>
            {/* Selected pills */}
            {selectedUsers.length > 0 && (
              <div
                className="flex flex-wrap gap-1.5"
                style={{ marginBottom: 8 }}
              >
                {selectedUsers.map((u) => (
                  <span
                    key={u.id}
                    className="flex items-center gap-1 rounded-full"
                    style={{
                      padding: "3px 8px 3px 4px",
                      fontSize: "11px",
                      fontWeight: 500,
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <Avatar
                      style={{
                        width: 18,
                        height: 18,
                      }}
                    >
                      <AvatarImage src={u.avatar} alt={u.name} />
                      <AvatarFallback style={{ fontSize: "7px" }}>
                        {u.initials}
                      </AvatarFallback>
                    </Avatar>
                    {u.name.split(" ")[0]}
                    <button onClick={() => toggleUser(u)} className="ml-0.5">
                      <X style={{ width: 10, height: 10 }} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div
              className="relative flex items-center"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
              }}
            >
              <Search
                className="absolute"
                style={{
                  left: 10,
                  width: 14,
                  height: 14,
                  color: "var(--muted-foreground)",
                }}
              />
              <input
                type="text"
                placeholder="Search people..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full bg-transparent outline-none"
                style={{
                  padding: "8px 12px 8px 32px",
                  fontSize: "var(--text-sm)",
                  color: "var(--foreground)",
                  fontFamily: "'Inter', sans-serif",
                }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredUsers.map((user) => {
              const isSelected = selectedUsers.some((u) => u.id === user.id);
              return (
                <button
                  key={user.id}
                  onClick={() => toggleUser(user)}
                  className="w-full flex items-center gap-3 text-left transition-colors"
                  style={{ padding: "8px 16px" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--accent)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <Avatar
                    style={{
                      width: 36,
                      height: 36,
                      border: "1px solid var(--border)",
                    }}
                  >
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className="flex-1"
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: 500,
                      color: "var(--foreground)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {user.name}
                  </span>
                  <div
                    className="shrink-0 flex items-center justify-center rounded-md transition-colors"
                    style={{
                      width: 20,
                      height: 20,
                      border: isSelected
                        ? "none"
                        : "1.5px solid var(--border)",
                      background: isSelected
                        ? "var(--primary)"
                        : "transparent",
                      borderRadius: "var(--radius)",
                    }}
                  >
                    {isSelected && (
                      <Check
                        style={{
                          width: 12,
                          height: 12,
                          color: "var(--primary-foreground)",
                        }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Next button */}
          {selectedUsers.length >= 2 && (
            <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
              <button
                onClick={() => setStep("group-name")}
                className="w-full rounded-lg transition-colors"
                style={{
                  padding: "10px",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  borderRadius: "var(--radius)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Next — {selectedUsers.length} selected
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Step: Name the group ──────────────────────────────────────── */}
      {step === "group-name" && (
        <div style={{ padding: "20px 16px" }} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--foreground)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Workshop Planning"
              autoFocus
              className="w-full outline-none"
              style={{
                padding: "10px 14px",
                fontSize: "var(--text-sm)",
                color: "var(--foreground)",
                background: "var(--input-background)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--foreground)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Members ({selectedUsers.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-1.5">
                  <Avatar style={{ width: 24, height: 24 }}>
                    <AvatarImage src={u.avatar} />
                    <AvatarFallback style={{ fontSize: "8px" }}>
                      {u.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--foreground)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {u.name.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreateGroup}
            disabled={!groupName.trim()}
            className="w-full rounded-lg transition-all"
            style={{
              padding: "10px",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              background: groupName.trim()
                ? "var(--primary)"
                : "var(--muted)",
              color: groupName.trim()
                ? "var(--primary-foreground)"
                : "var(--muted-foreground)",
              borderRadius: "var(--radius)",
              fontFamily: "'Inter', sans-serif",
              marginTop: 8,
              cursor: groupName.trim() ? "pointer" : "not-allowed",
            }}
          >
            Create Group
          </button>
        </div>
      )}

      {/* ── Step: Browse Space channels ───────────────────────────────── */}
      {step === "space-browse" && (
        <div className="flex-1 overflow-y-auto">
          {spaceChannels.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center text-center"
              style={{ padding: "48px 24px" }}
            >
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--muted-foreground)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                No Space channels available.
              </p>
            </div>
          ) : (
            spaceChannels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => onOpenConversation(ch)}
                className="w-full flex items-center gap-3 text-left transition-colors"
                style={{ padding: "10px 16px" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--accent)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div
                  className="shrink-0 flex items-center justify-center"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "calc(var(--radius) + 2px)",
                    background: ch.avatarColor ?? "var(--secondary)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  <Hash style={{ width: 18, height: 18 }} />
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: 500,
                      color: "var(--foreground)",
                      display: "block",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {ch.name}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--muted-foreground)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {ch.memberCount} members
                  </span>
                </div>
                {ch.unread > 0 && (
                  <span
                    className="shrink-0 rounded-full flex items-center justify-center"
                    style={{
                      minWidth: 18,
                      height: 18,
                      padding: "0 5px",
                      fontSize: "10px",
                      fontWeight: 700,
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {ch.unread}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}