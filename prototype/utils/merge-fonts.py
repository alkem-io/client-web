#!/usr/bin/env python3
"""
Merge font/text style properties from the Creative backup into the current prototype files.
Only touches: fontSize, fontWeight, fontFamily, letterSpacing inside style={{ }} blocks.
Does NOT replace files or change structure/features.
"""

import re
import os
import sys
import json

PROTO = "/Users/jeroennijkamp/Documents/Shadcn Ui Redesign Project/Resources/prototype/src"
BACKUP = "/Users/jeroennijkamp/Documents/Shadcn Ui Redesign Project/Resources/Prototype Creative/Redesign Alkemio Platform/src"

FONT_PROPS = {"fontSize", "fontWeight", "fontFamily", "letterSpacing"}

def extract_style_blocks(content):
    """
    Extract all style={{ ... }} blocks from JSX content.
    Returns list of (start_pos, end_pos, props_dict, raw_text)
    """
    blocks = []
    # Find all style={{ or style={{\n patterns
    pattern = re.compile(r'style=\{\{')
    for m in pattern.finditer(content):
        start = m.start()
        # Find matching }}
        brace_count = 0
        i = m.end() - 1  # Start at first {
        while i < len(content):
            if content[i] == '{':
                brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    end = i + 1
                    raw = content[start:end]
                    props = extract_props(raw)
                    blocks.append((start, end, props, raw))
                    break
            i += 1
    return blocks


def extract_props(style_text):
    """Extract property names and values from a style={{ }} block."""
    # Remove style={{ and }}
    inner = style_text
    inner = re.sub(r'^style=\{\{\s*', '', inner)
    inner = re.sub(r'\s*\}\}$', '', inner)

    props = {}
    # Match key: value patterns (handles quoted strings, numbers, variables)
    # This regex captures: propertyName: value
    for m in re.finditer(r'(\w+)\s*:\s*(.+?)(?:,\s*$|,\s*(?=\w+\s*:)|$)', inner, re.MULTILINE):
        key = m.group(1)
        val = m.group(2).strip().rstrip(',')
        props[key] = val

    return props


def get_context_signature(content, pos, window=150):
    """
    Get a context signature around a style block position.
    Uses surrounding text to match blocks between files.
    """
    start = max(0, pos - window)
    end = min(len(content), pos + window)
    chunk = content[start:end]
    # Remove whitespace variations for matching
    chunk = re.sub(r'\s+', ' ', chunk)
    return chunk


def get_element_context(content, pos):
    """Get the JSX element context around the style block."""
    # Look backward to find the element opening tag
    line_start = content.rfind('\n', 0, pos) + 1
    # Get a few lines before
    prev_lines_start = content.rfind('\n', 0, max(0, line_start - 200))
    context = content[prev_lines_start:pos + 50]
    # Extract key identifiers: className values, element names, text content
    return context


def find_matching_block(target_props, target_context, backup_blocks, backup_content):
    """
    Find the backup style block that best matches the current one.
    Match by non-font properties and surrounding context.
    """
    non_font_target = {k: v for k, v in target_props.items() if k not in FONT_PROPS}

    best_match = None
    best_score = 0

    for bstart, bend, bprops, braw in backup_blocks:
        non_font_backup = {k: v for k, v in bprops.items() if k not in FONT_PROPS}

        # Score: how many non-font properties match exactly
        score = 0
        for k, v in non_font_target.items():
            if k in non_font_backup:
                # Normalize values for comparison
                v1 = v.strip().strip('"').strip("'")
                v2 = non_font_backup[k].strip().strip('"').strip("'")
                if v1 == v2:
                    score += 2
                else:
                    score -= 1

        # Bonus for having the same keys
        if set(non_font_target.keys()) == set(non_font_backup.keys()):
            score += 3

        if score > best_score:
            best_score = score
            best_match = (bstart, bend, bprops, braw)

    return best_match if best_score >= 2 else None


def merge_font_props(current_raw, backup_props):
    """
    Add missing font properties from backup into the current style block.
    Returns the modified style text.
    """
    current_props = extract_props(current_raw)
    missing = {}

    for prop in FONT_PROPS:
        if prop in backup_props and prop not in current_props:
            missing[prop] = backup_props[prop]

    if not missing:
        return None  # Nothing to add

    # Insert the missing properties into the style block
    # Find the position after style={{ to insert
    result = current_raw

    # Find where to insert - after the opening {{ and before the first property or }}
    inner_match = re.search(r'style=\{\{\s*\n?', result)
    if not inner_match:
        return None

    # Build the new properties string
    # Detect indentation from existing properties
    existing_lines = result.split('\n')
    indent = '              '  # default
    for line in existing_lines[1:]:
        stripped = line.lstrip()
        if stripped and ':' in stripped:
            indent = line[:len(line) - len(stripped)]
            break

    new_props_lines = []
    for k, v in missing.items():
        # Ensure value ends with comma
        v_clean = v.rstrip(',')
        new_props_lines.append(f"{indent}{k}: {v_clean},")

    # Insert after the opening style={{
    insert_pos = inner_match.end()
    insert_text = '\n'.join(new_props_lines) + '\n'

    result = result[:insert_pos] + insert_text + result[insert_pos:]
    return result


def process_file(current_path, backup_path):
    """Process a single file pair, merging font properties from backup."""
    with open(current_path, 'r') as f:
        current_content = f.read()
    with open(backup_path, 'r') as f:
        backup_content = f.read()

    current_blocks = extract_style_blocks(current_content)
    backup_blocks = extract_style_blocks(backup_content)

    if not backup_blocks:
        return 0

    changes = []
    for cstart, cend, cprops, craw in current_blocks:
        # Check if this block is missing any font properties
        has_font = any(p in cprops for p in FONT_PROPS)
        
        # Find matching block in backup
        match = find_matching_block(cprops, get_element_context(current_content, cstart), backup_blocks, backup_content)
        
        if match:
            _, _, bprops, _ = match
            # Check if backup has font properties we're missing
            missing_fonts = {p: bprops[p] for p in FONT_PROPS if p in bprops and p not in cprops}
            if missing_fonts:
                new_raw = merge_font_props(craw, bprops)
                if new_raw and new_raw != craw:
                    changes.append((cstart, cend, craw, new_raw))

    if not changes:
        return 0

    # Apply changes in reverse order (so positions stay valid)
    result = current_content
    for cstart, cend, old, new in sorted(changes, key=lambda x: x[0], reverse=True):
        result = result[:cstart] + new + result[cend:]

    with open(current_path, 'w') as f:
        f.write(result)

    return len(changes)


def main():
    # Files with significant missing font properties (from our analysis)
    affected_files = [
        "app/components/search/SearchOverlay.tsx",
        "app/components/messaging/SpaceChannelView.tsx",
        "app/components/messaging/ChatView.tsx",
        "app/components/messaging/NewConversationFlow.tsx",
        "app/components/messaging/SpaceChatTab.tsx",
        "app/components/messaging/ConversationList.tsx",
        "app/components/layout/Header.tsx",
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
        "app/pages/Dashboard.tsx",
        "app/pages/SpaceHome.tsx",
        "app/components/dashboard/ActivityFeed.tsx",
        "app/components/dashboard/RecentSpaces.tsx",
        "app/components/layout/Sidebar.tsx",
        "app/components/space/SpaceNavigationTabs.tsx",
        "app/components/space/ChannelTabs.tsx",
        "app/components/space/SpaceSidebar.tsx",
        "app/components/space/SubspaceSidebar.tsx",
        "app/components/space/SpaceMembers.tsx",
        "app/components/space/SpaceFeed.tsx",
        "app/components/space/SpaceResourcesList.tsx",
        "app/components/space/PostCard.tsx",
        "app/components/space/AddPostModal.tsx",
        "app/components/space/SpaceSettingsAbout.tsx",
        "app/components/space/SpaceSettingsCommunity.tsx",
        "app/components/space/SpaceSettingsSettings.tsx",
        "app/components/space/SpaceSettingsLayout.tsx",
        "app/components/space/SpaceSettingsSidebar.tsx",
        "app/components/space/SpaceSettingsStorage.tsx",
        "app/components/space/SpaceSettingsSubspaces.tsx",
        "app/components/space/SpaceSettingsTemplates.tsx",
        "app/components/space/SpaceSettingsAccount.tsx",
        "app/components/space/SubspaceSettingsLayout.tsx",
        "app/components/dialogs/CreateSpaceDialog.tsx",
        "app/components/dialogs/ExploreSpacesDialog.tsx",
        "app/components/dialogs/MessagesDialog.tsx",
        "app/components/dialogs/PostDetailDialog.tsx",
        "app/components/dialogs/ResponseDetailDialog.tsx",
        "app/components/create-space/CreateSpaceChat.tsx",
        "app/components/create-space/CreateSpaceForm.tsx",
        "app/components/template-library/TemplateDetail.tsx",
        "app/components/template-library/TemplateLibrary.tsx",
        "app/components/template-library/TemplatePackDetail.tsx",
        "app/components/user/OrganizationCard.tsx",
        "app/components/user/SpaceGridCard.tsx",
        "app/components/user/UserProfileHeader.tsx",
        "app/components/messaging/SpaceChatDrawer.tsx",
        "app/components/messaging/SpaceChatPanel.tsx",
        "app/components/layout/Footer.tsx",
        "app/layouts/MainLayout.tsx",
        "app/layouts/RootWrapper.tsx",
        "app/contexts/LanguageContext.tsx",
        "app/pages/UserProfileSettingsPage.tsx",
        "app/pages/UserAccountPage.tsx",
        "app/pages/UserGenericSettingsPage.tsx",
        "app/pages/UserMembershipPage.tsx",
        "app/pages/UserNotificationsPage.tsx",
        "app/pages/UserOrganizationsPage.tsx",
        "app/pages/UserProfilePage.tsx",
        "app/pages/SpaceCommunity.tsx",
        "app/pages/SpaceKnowledgeBase.tsx",
        "app/pages/SpaceSettingsPage.tsx",
        "app/pages/SpaceSubspaces.tsx",
        "app/pages/SubspacePage.tsx",
        "app/pages/SubspaceSettingsPage.tsx",
        "app/pages/SpaceChatPage.tsx",
        "app/pages/DesignSystemPage.tsx",
    ]

    total_changes = 0
    for relpath in affected_files:
        current = os.path.join(PROTO, relpath)
        backup = os.path.join(BACKUP, relpath)

        if not os.path.exists(current):
            continue
        if not os.path.exists(backup):
            continue

        count = process_file(current, backup)
        if count > 0:
            print(f"  ✓ {relpath}: restored {count} font properties")
        total_changes += count

    print(f"\nTotal: {total_changes} style blocks updated across {len(affected_files)} files")


if __name__ == "__main__":
    main()
