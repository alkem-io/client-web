#!/usr/bin/env python3
"""
V5: FINAL approach. Use unified diff hunks.
For files that are nearly identical in size, generate a unified diff.
For each hunk, check if it ONLY adds font-related properties.
If so, apply that hunk. Skip hunks that change structure.

This is the most precise approach - it only applies changes that are
purely font property additions/modifications.
"""
import re
import os
import subprocess

PROTO = "/Users/jeroennijkamp/Documents/Shadcn Ui Redesign Project/Resources/prototype/src"
BACKUP = "/Users/jeroennijkamp/Documents/Shadcn Ui Redesign Project/Resources/Prototype Creative/Redesign Alkemio Platform/src"

FONT_RE = re.compile(r'^\s*(fontSize|fontWeight|fontFamily|letterSpacing)\s*:', re.IGNORECASE)


def is_font_only_change(removed_lines, added_lines):
    """
    Check if a diff hunk represents ONLY font property changes.
    Returns True if added lines contain font properties that removed lines don't,
    and all other content is identical.
    """
    # Strip all font property lines from both sides
    r_non_font = [l for l in removed_lines if not FONT_RE.match(l.strip())]
    a_non_font = [l for l in added_lines if not FONT_RE.match(l.strip())]
    
    # Check if what remains are single-line style blocks that differ only in font props
    if len(r_non_font) == len(a_non_font):
        # Check line by line
        all_match = True
        for rl, al in zip(r_non_font, a_non_font):
            # Normalize: remove font properties from inline styles for comparison
            rl_clean = remove_inline_font(rl)
            al_clean = remove_inline_font(al)
            if rl_clean.strip() != al_clean.strip():
                all_match = False
                break
        if all_match and len(added_lines) > len(removed_lines):
            return True
    
    # Also handle: single removed line vs multiple added lines where
    # the added lines add font props to a style block
    if len(removed_lines) == 1 and len(added_lines) > 1:
        r_line = removed_lines[0].strip()
        a_combined = ' '.join(l.strip() for l in added_lines)
        r_clean = remove_inline_font(r_line)
        a_clean = remove_inline_font(a_combined)
        if r_clean.strip() == a_clean.strip():
            return True
    
    return False


def remove_inline_font(line):
    """Remove font properties from a line for comparison."""
    # Remove fontSize: ..., fontWeight: ..., fontFamily: ..., letterSpacing: ...
    line = re.sub(r",?\s*(fontSize|fontWeight|fontFamily|letterSpacing)\s*:\s*[^,}]+,?", '', line)
    line = re.sub(r'\s+', ' ', line)
    return line


def get_hunks(current_path, backup_path):
    """Get unified diff hunks between current and backup."""
    result = subprocess.run(
        ['diff', '-u', current_path, backup_path],
        capture_output=True, text=True
    )
    
    hunks = []
    current_hunk = None
    
    for line in result.stdout.split('\n'):
        if line.startswith('@@'):
            if current_hunk:
                hunks.append(current_hunk)
            # Parse hunk header: @@ -start,count +start,count @@
            m = re.match(r'@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@', line)
            if m:
                current_hunk = {
                    'cur_start': int(m.group(1)),
                    'cur_count': int(m.group(2) or 1),
                    'bak_start': int(m.group(3)),
                    'bak_count': int(m.group(4) or 1),
                    'removed': [],
                    'added': [],
                    'context': [],
                }
        elif current_hunk:
            if line.startswith('-'):
                current_hunk['removed'].append(line[1:])
            elif line.startswith('+'):
                current_hunk['added'].append(line[1:])
            elif line.startswith(' '):
                current_hunk['context'].append(line[1:])
    
    if current_hunk:
        hunks.append(current_hunk)
    
    return hunks


def apply_font_hunks(current_path, backup_path):
    """
    Apply only font-related hunks from the diff.
    Returns count of applied hunks.
    """
    hunks = get_hunks(current_path, backup_path)
    
    with open(current_path, 'r') as f:
        cur_lines = f.readlines()
    with open(backup_path, 'r') as f:
        bak_lines = f.readlines()
    
    applied = 0
    offset = 0  # Line number offset from insertions
    
    for hunk in hunks:
        removed = hunk['removed']
        added = hunk['added']
        
        # Skip hunks with no additions
        if not added:
            continue
        
        # Check if added lines contain font properties
        added_has_font = any(FONT_RE.match(l.strip()) for l in added)
        added_has_font |= any(
            re.search(r'(fontSize|fontWeight|fontFamily|letterSpacing)\s*:', l)
            for l in added
        )
        
        if not added_has_font:
            continue
        
        # Check: are ALL added lines font properties?
        all_font = all(
            FONT_RE.match(l.strip()) or not l.strip()
            for l in added
        )
        
        if all_font and not removed:
            # Pure insertion of font property lines
            # Find where to insert in current file
            insert_line = hunk['cur_start'] - 1 + offset
            for al in reversed(added):
                cur_lines.insert(insert_line, al + '\n' if not al.endswith('\n') else al)
                offset += 1
            applied += 1
        elif is_font_only_change(removed, added):
            # Replacement where only font props differ
            start = hunk['cur_start'] - 1 + offset
            end = start + len(removed)
            
            # Replace the removed lines with added lines
            new_added = [l + '\n' if not l.endswith('\n') else l for l in added]
            cur_lines[start:end] = new_added
            offset += len(added) - len(removed)
            applied += 1
    
    if applied > 0:
        with open(current_path, 'w') as f:
            f.writelines(cur_lines)
    
    return applied


AFFECTED_FILES = [
    "app/components/search/SearchOverlay.tsx",
    "app/components/messaging/SpaceChannelView.tsx",
    "app/components/messaging/ChatView.tsx",
    "app/components/messaging/NewConversationFlow.tsx",
    "app/components/messaging/SpaceChatTab.tsx",
    "app/components/messaging/ConversationList.tsx",
    "app/components/messaging/ChatRail.tsx",
    "app/components/messaging/SpaceChannelComposer.tsx",
    "app/components/analytics/ForceGraph.tsx",
    "app/components/analytics/AnalyticsGraphExplorer.tsx",
    "app/components/messaging/MessagingHub.tsx",
    "app/components/messaging/MessageComposer.tsx",
    "app/components/space/SpaceHeader.tsx",
    "app/components/space/SpaceCard.tsx",
    "app/pages/BrowseSpacesPage.tsx",
    "app/pages/MessagesPage.tsx",
    "app/pages/NotificationsPage.tsx",
    "app/pages/OnboardingPage.tsx",
    "app/pages/NotFoundPage.tsx",
    "app/pages/AdminPage.tsx",
    "app/components/messaging/SpaceChatPanel.tsx",
    "app/components/messaging/SpaceChatDrawer.tsx",
    "app/components/layout/Sidebar.tsx",
    "app/components/space/SpaceNavigationTabs.tsx",
    "app/components/space/ChannelTabs.tsx",
]

def main():
    total = 0
    for rel in AFFECTED_FILES:
        cur = os.path.join(PROTO, rel)
        bak = os.path.join(BACKUP, rel)
        if not os.path.exists(cur) or not os.path.exists(bak):
            continue
        n = apply_font_hunks(cur, bak)
        if n > 0:
            print(f"  ✓ {rel}: {n} hunks applied")
        total += n
    print(f"\nTotal: {total} font-only hunks applied")

if __name__ == "__main__":
    main()
