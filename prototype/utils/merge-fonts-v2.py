#!/usr/bin/env python3
"""
PASS 1: Revert damage from the first merge attempt.
Find all style blocks that were corrupted and fix them.
Then re-merge font props correctly.
"""

import re
import os
import sys

PROTO = "/Users/jeroennijkamp/Documents/Shadcn Ui Redesign Project/Resources/prototype/src"
BACKUP = "/Users/jeroennijkamp/Documents/Shadcn Ui Redesign Project/Resources/Prototype Creative/Redesign Alkemio Platform/src"

FONT_PROPS = {"fontSize", "fontWeight", "fontFamily", "letterSpacing"}

def find_style_blocks(content):
    """
    Find all style={{ ... }} blocks. Returns list of (start, end, inner_text).
    Handles both single-line and multi-line blocks.
    """
    blocks = []
    i = 0
    while i < len(content):
        idx = content.find('style={{', i)
        if idx == -1:
            break
        # Find matching }}
        start = idx
        brace_depth = 0
        j = idx + len('style={')  # position at first {
        while j < len(content):
            ch = content[j]
            if ch == '{':
                brace_depth += 1
            elif ch == '}':
                brace_depth -= 1
                if brace_depth == 0:
                    end = j + 1  # include the final }
                    block_text = content[start:end]
                    blocks.append((start, end, block_text))
                    break
            j += 1
        i = idx + 1
    return blocks


def parse_style_props(block_text):
    """
    Parse a style={{ ... }} block into a dict of property: value.
    Returns (prefix, props_dict, suffix) where prefix = 'style={{' portion
    """
    # Get the inner content between {{ and }}
    m = re.match(r'style=\{\{(.*)\}\}', block_text, re.DOTALL)
    if not m:
        return None
    inner = m.group(1)
    
    props = {}
    # Match property: value pairs
    # Handle various value types: strings, numbers, ternaries, function calls, etc.
    # Use a state machine approach for reliability
    
    lines = inner.split('\n')
    current_key = None
    current_val = None
    paren_depth = 0
    
    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith('//'):
            continue
            
        # If we're in a value continuation (nested parens/ternary)
        if current_key and paren_depth > 0:
            current_val += ' ' + stripped.rstrip(',')
            paren_depth += stripped.count('(') - stripped.count(')')
            paren_depth += stripped.count('{') - stripped.count('}')
            if paren_depth <= 0:
                props[current_key] = current_val.strip()
                current_key = None
                current_val = None
                paren_depth = 0
            continue
        
        # Try to match key: value
        km = re.match(r'(\w+)\s*:\s*(.+)', stripped)
        if km:
            key = km.group(1)
            val = km.group(2).rstrip(',').strip()
            
            # Check for unclosed parens/ternaries
            paren_depth = val.count('(') - val.count(')')
            paren_depth += val.count('{') - val.count('}')
            
            if paren_depth > 0:
                current_key = key
                current_val = val
            else:
                props[key] = val
                paren_depth = 0
    
    return props


def build_style_block(props, indent='            '):
    """Build a style={{ ... }} string from a props dict."""
    if not props:
        return 'style={{}}'
    
    if len(props) <= 2:
        # Single line
        pairs = ', '.join(f'{k}: {v}' for k, v in props.items())
        return f'style={{{{ {pairs} }}}}'
    
    # Multi-line
    lines = ['style={{']
    for k, v in props.items():
        lines.append(f'{indent}  {k}: {v},')
    lines.append(f'{indent}}}}}')
    return '\n'.join(lines)


def get_context_key(content, pos, radius=200):
    """Get surrounding context to identify a style block's location."""
    start = max(0, pos - radius)
    end = min(len(content), pos + 20)
    ctx = content[start:end]
    # Normalize whitespace
    ctx = re.sub(r'\s+', ' ', ctx)
    return ctx


def match_blocks(current_blocks, current_content, backup_blocks, backup_content):
    """
    Match style blocks between files using context similarity.
    Returns list of (current_block, backup_block) pairs.
    """
    matches = []
    used_backup = set()
    
    for ci, (cstart, cend, ctext) in enumerate(current_blocks):
        cprops = parse_style_props(ctext)
        if cprops is None:
            continue
        non_font_current = {k: v for k, v in cprops.items() if k not in FONT_PROPS}
        
        best_bi = None
        best_score = -1
        
        for bi, (bstart, bend, btext) in enumerate(backup_blocks):
            if bi in used_backup:
                continue
            bprops = parse_style_props(btext)
            if bprops is None:
                continue
            non_font_backup = {k: v for k, v in bprops.items() if k not in FONT_PROPS}
            
            # Score by matching non-font properties
            score = 0
            for k, v in non_font_current.items():
                if k in non_font_backup:
                    v1 = re.sub(r'\s+', '', str(v))
                    v2 = re.sub(r'\s+', '', str(non_font_backup[k]))
                    if v1 == v2:
                        score += 3
                    elif v1.replace('"', "'") == v2.replace('"', "'"):
                        score += 2

            # Require decent match
            if score > best_score and score >= 3:
                best_score = score
                best_bi = bi
        
        if best_bi is not None:
            used_backup.add(best_bi)
            matches.append((ci, best_bi))
    
    return matches


def process_file(current_path, backup_path, dry_run=False):
    """
    For each style block in current:
    1. Find the matching block in backup
    2. If backup has font properties that current lacks, add them
    Returns (changes_count, new_content)
    """
    with open(current_path, 'r') as f:
        content = f.read()
    with open(backup_path, 'r') as f:
        backup_content = f.read()
    
    current_blocks = find_style_blocks(content)
    backup_blocks = find_style_blocks(backup_content)
    
    if not backup_blocks:
        return 0
    
    matched = match_blocks(current_blocks, content, backup_blocks, backup_content)
    
    replacements = []  # (start, end, old_text, new_text)
    
    for ci, bi in matched:
        cstart, cend, ctext = current_blocks[ci]
        bstart, bend, btext = backup_blocks[bi]
        
        cprops = parse_style_props(ctext)
        bprops = parse_style_props(btext)
        
        if cprops is None or bprops is None:
            continue
        
        # Find missing font props
        missing = {}
        for fp in FONT_PROPS:
            if fp in bprops and fp not in cprops:
                missing[fp] = bprops[fp]
        
        if not missing:
            continue
        
        # Build new props dict preserving order
        new_props = {}
        # Add font props first (fontSize, fontWeight, fontFamily, letterSpacing)
        for fp in ['fontSize', 'fontWeight', 'letterSpacing', 'fontFamily']:
            if fp in cprops:
                new_props[fp] = cprops[fp]
            elif fp in missing:
                new_props[fp] = missing[fp]
        # Then all non-font props
        for k, v in cprops.items():
            if k not in FONT_PROPS:
                new_props[k] = v
        
        # Detect indentation of the style block
        line_start = content.rfind('\n', 0, cstart)
        if line_start == -1:
            line_start = 0
        else:
            line_start += 1
        leading = content[line_start:cstart]
        # If style= is on its own line, use that indent; otherwise use parent indent
        indent_match = re.match(r'^(\s*)', leading)
        indent = indent_match.group(1) if indent_match else '            '
        
        # Check if original was single-line or multi-line
        is_multiline = '\n' in ctext
        
        if is_multiline:
            # Multi-line: insert missing props preserving format
            new_text = ctext
            # Find the first property line to get its indentation
            prop_indent = indent + '  '
            for line in ctext.split('\n')[1:]:
                stripped = line.lstrip()
                if stripped and ':' in stripped and not stripped.startswith('//'):
                    prop_indent = line[:len(line) - len(stripped)]
                    break
            
            # Insert missing props right after style={{
            insert_lines = []
            for fp in ['fontSize', 'fontWeight', 'letterSpacing', 'fontFamily']:
                if fp in missing:
                    insert_lines.append(f'{prop_indent}{fp}: {missing[fp]},')
            
            if insert_lines:
                # Find position right after 'style={{\n' or 'style={{ '
                insert_after = 'style={{'
                idx = new_text.find(insert_after)
                if idx != -1:
                    pos = idx + len(insert_after)
                    # If next char is newline, insert after it
                    if pos < len(new_text) and new_text[pos] == '\n':
                        pos += 1
                    insert_text = '\n'.join(insert_lines) + '\n'
                    new_text = new_text[:pos] + insert_text + new_text[pos:]
        else:
            # Single-line: rebuild entirely
            pairs = []
            for k, v in new_props.items():
                pairs.append(f'{k}: {v}')
            new_text = 'style={{ ' + ', '.join(pairs) + ' }}'
        
        replacements.append((cstart, cend, ctext, new_text))
    
    if not replacements:
        return 0
    
    # Apply in reverse order
    result = content
    for start, end, old, new in sorted(replacements, key=lambda x: x[0], reverse=True):
        result = result[:start] + new + result[end:]
    
    if not dry_run:
        with open(current_path, 'w') as f:
            f.write(result)
    
    return len(replacements)


# Files to process
AFFECTED_FILES = [
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
    "app/pages/UserProfileSettingsPage.tsx",
    "app/pages/UserAccountPage.tsx",
    "app/pages/SpaceCommunity.tsx",
    "app/pages/SpaceKnowledgeBase.tsx",
    "app/pages/SpaceSettingsPage.tsx",
    "app/pages/SpaceSubspaces.tsx",
    "app/pages/SubspacePage.tsx",
    "app/pages/SubspaceSettingsPage.tsx",
    "app/pages/SpaceChatPage.tsx",
    "app/pages/DesignSystemPage.tsx",
]


def main():
    total = 0
    for rel in AFFECTED_FILES:
        cur = os.path.join(PROTO, rel)
        bak = os.path.join(BACKUP, rel)
        if not os.path.exists(cur) or not os.path.exists(bak):
            continue
        n = process_file(cur, bak)
        if n > 0:
            print(f"  ✓ {rel}: {n} blocks")
        total += n
    print(f"\nTotal: {total} style blocks updated")


if __name__ == "__main__":
    main()
