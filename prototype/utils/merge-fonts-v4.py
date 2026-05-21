#!/usr/bin/env python3
"""
V4: For files that are nearly identical in size (0-5% diff),
use line-by-line comparison with fuzzy matching to find
where font properties should be inserted.

Strategy: For each style={{ block in backup that has font props,
find the EXACT same block in current (by nearby line content),
and if current is missing font props, add them.
"""
import re
import os
import difflib

PROTO = "/Users/jeroennijkamp/Documents/Shadcn Ui Redesign Project/Resources/prototype/src"
BACKUP = "/Users/jeroennijkamp/Documents/Shadcn Ui Redesign Project/Resources/Prototype Creative/Redesign Alkemio Platform/src"

FONT_PROP_NAMES = {'fontSize', 'fontWeight', 'fontFamily', 'letterSpacing'}


def find_style_blocks_with_lines(lines):
    """
    Find all style={{ }} blocks with their line ranges and properties.
    Returns: [(start_line, end_line, {prop: val}, [lines_of_block])]
    """
    blocks = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if 'style={{' not in line:
            i += 1
            continue
        
        # Find the full block
        start = i
        block_text = line
        
        # Count braces from the style={{ position
        idx = line.index('style={{')
        brace_depth = 0
        for ch in line[idx:]:
            if ch == '{': brace_depth += 1
            elif ch == '}': brace_depth -= 1
        
        if brace_depth <= 0:
            # Single line block
            end = i
        else:
            # Multi-line
            j = i + 1
            while j < len(lines) and brace_depth > 0:
                for ch in lines[j]:
                    if ch == '{': brace_depth += 1
                    elif ch == '}': brace_depth -= 1
                block_text += '\n' + lines[j]
                if brace_depth <= 0:
                    break
                j += 1
            end = j
        
        # Extract properties
        props = {}
        m = re.search(r'style=\{\{(.+?)\}\}', block_text, re.DOTALL)
        if m:
            inner = m.group(1)
            for pm in re.finditer(r'(\w+)\s*:\s*(.+?)(?:,\s*(?=\n|\w+\s*:)|,?\s*$)', inner, re.MULTILINE):
                props[pm.group(1)] = pm.group(2).strip().rstrip(',')
        
        blocks.append((start, end, props, lines[start:end+1]))
        i = end + 1
    
    return blocks


def get_context(lines, start, end, window=3):
    """Get surrounding context lines for matching."""
    before = []
    for i in range(max(0, start - window), start):
        before.append(lines[i].strip())
    after = []
    for i in range(end + 1, min(len(lines), end + 1 + window)):
        after.append(lines[i].strip())
    return ' '.join(before + after)


def match_blocks_v4(cur_blocks, cur_lines, bak_blocks, bak_lines):
    """
    Match blocks between files using context similarity.
    Returns list of (cur_idx, bak_idx) pairs.
    """
    matches = []
    used_bak = set()
    
    for ci, (cs, ce, cprops, cblock) in enumerate(cur_blocks):
        c_ctx = get_context(cur_lines, cs, ce, 5)
        
        best_bi = None
        best_ratio = 0
        
        for bi, (bs, be, bprops, bblock) in enumerate(bak_blocks):
            if bi in used_bak:
                continue
            
            # Check if backup has font props we might want
            b_font = {k: v for k, v in bprops.items() if k in FONT_PROP_NAMES}
            if not b_font:
                continue
            
            b_ctx = get_context(bak_lines, bs, be, 5)
            
            # Use SequenceMatcher for context similarity
            ratio = difflib.SequenceMatcher(None, c_ctx, b_ctx).ratio()
            
            # Also check property similarity
            c_nf = {k for k in cprops if k not in FONT_PROP_NAMES}
            b_nf = {k for k in bprops if k not in FONT_PROP_NAMES}
            if c_nf and b_nf:
                prop_overlap = len(c_nf & b_nf) / max(len(c_nf), len(b_nf))
                ratio = ratio * 0.6 + prop_overlap * 0.4
            
            if ratio > best_ratio:
                best_ratio = ratio
                best_bi = bi
        
        if best_bi is not None and best_ratio > 0.3:
            used_bak.add(best_bi)
            matches.append((ci, best_bi))
    
    return matches


def process_file(current_path, backup_path):
    with open(current_path, 'r') as f:
        cur_lines = f.read().split('\n')
    with open(backup_path, 'r') as f:
        bak_lines = f.read().split('\n')
    
    cur_blocks = find_style_blocks_with_lines(cur_lines)
    bak_blocks = find_style_blocks_with_lines(bak_lines)
    
    matches = match_blocks_v4(cur_blocks, cur_lines, bak_blocks, bak_lines)
    
    changes = []
    
    for ci, bi in matches:
        cs, ce, cprops, cblock_lines = cur_blocks[ci]
        bs, be, bprops, bblock_lines = bak_blocks[bi]
        
        missing = {}
        for fp in FONT_PROP_NAMES:
            if fp in bprops and fp not in cprops:
                missing[fp] = bprops[fp]
        
        if not missing:
            continue
        
        changes.append((cs, ce, cblock_lines, missing, cprops))
    
    if not changes:
        return 0
    
    # Apply changes (reverse order)
    new_lines = list(cur_lines)
    offset = 0
    
    for cs, ce, cblock_lines, missing, cprops in sorted(changes, key=lambda x: x[0], reverse=True):
        is_single = (cs == ce)
        
        if is_single:
            line = new_lines[cs]
            m = re.search(r'style=\{\{(.+?)\}\}', line)
            if m:
                inner = m.group(1).strip()
                new_parts = []
                for fp in ['fontSize', 'fontWeight', 'letterSpacing', 'fontFamily']:
                    if fp in missing:
                        new_parts.append(f"{fp}: {missing[fp]}")
                all_inner = ', '.join(new_parts) + (', ' + inner if inner else '')
                new_style = f'style={{{{ {all_inner} }}}}'
                new_lines[cs] = line[:m.start()] + new_style + line[m.end():]
        else:
            # Multi-line: find indent and insert after style={{
            if cs + 1 < len(new_lines):
                next_line = new_lines[cs + 1]
                indent_m = re.match(r'^(\s+)', next_line)
                indent = indent_m.group(1) if indent_m else '              '
            else:
                indent = '              '
            
            insert_idx = cs + 1
            for fp in reversed(['fontSize', 'fontWeight', 'letterSpacing', 'fontFamily']):
                if fp in missing:
                    new_lines.insert(insert_idx, f'{indent}{fp}: {missing[fp]},')
    
    with open(current_path, 'w') as f:
        f.write('\n'.join(new_lines))
    
    return len(changes)


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
        n = process_file(cur, bak)
        if n > 0:
            print(f"  ✓ {rel}: {n} blocks")
        total += n
    print(f"\nTotal: {total} blocks enriched")


if __name__ == "__main__":
    main()
