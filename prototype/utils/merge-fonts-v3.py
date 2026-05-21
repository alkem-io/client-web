#!/usr/bin/env python3
"""
V3: Use a completely different strategy.
For each file, run a unified diff and look for hunks where:
  - Backup ADDS font property lines into existing style blocks
  - Current is MISSING those same font property lines
Then insert them at the correct position.

Also handles: lines where backup has style={{ with font props }}
but current has style={{ without font props }}, on a single line.
"""
import re
import os
import subprocess
import sys

PROTO = "/Users/jeroennijkamp/Documents/Shadcn Ui Redesign Project/Resources/prototype/src"
BACKUP = "/Users/jeroennijkamp/Documents/Shadcn Ui Redesign Project/Resources/Prototype Creative/Redesign Alkemio Platform/src"

FONT_PROPS_RE = re.compile(r'^\s*(fontSize|fontWeight|fontFamily|letterSpacing)\s*:', re.MULTILINE)
FONT_PROP_NAMES = {'fontSize', 'fontWeight', 'fontFamily', 'letterSpacing'}


def is_font_prop_line(line):
    """Check if a line is solely a font property declaration in a style object."""
    stripped = line.strip().rstrip(',')
    return bool(re.match(r'^(fontSize|fontWeight|fontFamily|letterSpacing)\s*:', stripped))


def get_line_indent(lines, line_idx):
    """Get the indentation of a line."""
    if line_idx < len(lines):
        m = re.match(r'^(\s*)', lines[line_idx])
        return m.group(1) if m else ''
    return ''


def process_file_v3(current_path, backup_path):
    """
    Strategy: line-by-line comparison of style blocks.
    1. Find all style={{ blocks in both files
    2. For each block in current, find the best matching block in backup by:
       - Looking at the properties that exist in both (non-font)
       - Context around the block (element, className, etc.)
    3. For matched blocks, take the font properties from backup and insert into current
    """
    with open(current_path, 'r') as f:
        current = f.read()
    with open(backup_path, 'r') as f:
        backup = f.read()
    
    cur_lines = current.split('\n')
    bak_lines = backup.split('\n')
    
    changes = 0
    new_lines = list(cur_lines)
    offset = 0  # Track insertions that shift line numbers
    
    # Find all style block ranges in current
    cur_blocks = find_style_block_ranges(cur_lines)
    bak_blocks = find_style_block_ranges(bak_lines)
    
    used_bak = set()
    
    for ci, (cstart, cend) in enumerate(cur_blocks):
        # Extract current block's non-font properties
        c_props = extract_block_props(cur_lines, cstart, cend)
        c_non_font = {k: v for k, v in c_props.items() if k not in FONT_PROP_NAMES}
        c_has_font = {k: v for k, v in c_props.items() if k in FONT_PROP_NAMES}
        
        # Get context: 3 lines before the style block
        ctx_lines = []
        for i in range(max(0, cstart-3), cstart):
            ctx_lines.append(cur_lines[i].strip())
        c_context = ' '.join(ctx_lines)
        
        # Find best matching backup block
        best_bi = None
        best_score = 0
        
        for bi, (bstart, bend) in enumerate(bak_blocks):
            if bi in used_bak:
                continue
            b_props = extract_block_props(bak_lines, bstart, bend)
            b_non_font = {k: v for k, v in b_props.items() if k not in FONT_PROP_NAMES}
            b_font = {k: v for k, v in b_props.items() if k in FONT_PROP_NAMES}
            
            if not b_font:
                continue  # Backup block has no font props, nothing to merge
            
            # Score by matching non-font properties
            score = 0
            for k, v in c_non_font.items():
                if k in b_non_font:
                    v1 = normalize_val(v)
                    v2 = normalize_val(b_non_font[k])
                    if v1 == v2:
                        score += 3
                    elif v1 in v2 or v2 in v1:
                        score += 1
            
            # Context bonus: check if nearby lines match
            b_ctx_lines = []
            for i in range(max(0, bstart-3), bstart):
                b_ctx_lines.append(bak_lines[i].strip())
            b_context = ' '.join(b_ctx_lines)
            
            # Simple text overlap score for context
            c_words = set(c_context.split())
            b_words = set(b_context.split())
            if c_words and b_words:
                overlap = len(c_words & b_words) / max(len(c_words), len(b_words))
                score += int(overlap * 5)
            
            if score > best_score:
                best_score = score
                best_bi = bi
        
        if best_bi is None or best_score < 2:
            continue
        
        used_bak.add(best_bi)
        bstart, bend = bak_blocks[best_bi]
        b_props = extract_block_props(bak_lines, bstart, bend)
        
        # Find missing font properties
        missing_font = {}
        for fp in FONT_PROP_NAMES:
            if fp in b_props and fp not in c_props:
                missing_font[fp] = b_props[fp]
        
        if not missing_font:
            continue
        
        # Insert the missing font properties into the current block
        # Find the right position: after style={{ and before the first existing property
        adj_cstart = cstart + offset
        adj_cend = cend + offset
        
        # Check if it's a single-line style block
        is_single_line = (cstart == cend)
        
        if is_single_line:
            # Rebuild the single-line style block with missing props
            line = new_lines[adj_cstart]
            # Find the style={{ }} part
            m = re.search(r'style=\{\{([^}]*)\}\}', line)
            if m:
                inner = m.group(1).strip()
                # Parse existing props
                existing = inner
                # Add missing font props
                new_props = []
                for fp in ['fontSize', 'fontWeight', 'letterSpacing', 'fontFamily']:
                    if fp in missing_font:
                        new_props.append(f"{fp}: {missing_font[fp]}")
                if existing:
                    all_props = ', '.join(new_props) + ', ' + existing
                else:
                    all_props = ', '.join(new_props)
                new_style = f'style={{{{ {all_props} }}}}'
                new_line = line[:m.start()] + new_style + line[m.end():]
                new_lines[adj_cstart] = new_line
                changes += 1
        else:
            # Multi-line: insert font prop lines after the style={{ line
            indent = get_line_indent(new_lines, adj_cstart + 1)
            if not indent:
                indent = get_line_indent(new_lines, adj_cstart) + '  '
            
            insert_lines = []
            for fp in ['fontSize', 'fontWeight', 'letterSpacing', 'fontFamily']:
                if fp in missing_font:
                    insert_lines.append(f'{indent}{fp}: {missing_font[fp]},')
            
            if insert_lines:
                # Insert after the style={{ line
                insert_pos = adj_cstart + 1
                for il in reversed(insert_lines):
                    new_lines.insert(insert_pos, il)
                    offset += 1
                changes += 1
    
    if changes > 0:
        with open(current_path, 'w') as f:
            f.write('\n'.join(new_lines))
    
    return changes


def find_style_block_ranges(lines):
    """Find (start_line, end_line) for each style={{ }} block."""
    blocks = []
    i = 0
    while i < len(lines):
        line = lines[i]
        idx = line.find('style={{')
        if idx == -1:
            i += 1
            continue
        
        # Check if it closes on the same line
        rest = line[idx:]
        brace_depth = 0
        for ch in rest:
            if ch == '{':
                brace_depth += 1
            elif ch == '}':
                brace_depth -= 1
                if brace_depth == 0:
                    blocks.append((i, i))  # Single line
                    break
        else:
            # Multi-line block - find the closing }}
            j = i + 1
            while j < len(lines):
                for ch in lines[j]:
                    if ch == '{':
                        brace_depth += 1
                    elif ch == '}':
                        brace_depth -= 1
                        if brace_depth == 0:
                            blocks.append((i, j))
                            break
                if brace_depth <= 0:
                    break
                j += 1
        i += 1
    return blocks


def extract_block_props(lines, start, end):
    """Extract property: value pairs from a style block."""
    if start == end:
        # Single line
        line = lines[start]
        m = re.search(r'style=\{\{(.+?)\}\}', line)
        if not m:
            return {}
        inner = m.group(1).strip()
    else:
        # Multi-line
        block_lines = lines[start:end+1]
        inner = '\n'.join(block_lines)
        m = re.search(r'style=\{\{(.+)\}\}', inner, re.DOTALL)
        if not m:
            return {}
        inner = m.group(1).strip()
    
    props = {}
    # Simple property extraction
    for pm in re.finditer(r'(\w+)\s*:\s*(.+?)(?:,\s*$|,\s*(?=\w+\s*:)|$)', inner, re.MULTILINE):
        key = pm.group(1)
        val = pm.group(2).strip().rstrip(',')
        props[key] = val
    
    return props


def normalize_val(v):
    """Normalize a property value for comparison."""
    v = str(v).strip().strip('"').strip("'").strip()
    v = re.sub(r'\s+', ' ', v)
    return v


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
    "app/components/messaging/SpaceChatPanel.tsx",
    "app/components/messaging/SpaceChatDrawer.tsx",
    "app/components/layout/Footer.tsx",
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
        n = process_file_v3(cur, bak)
        if n > 0:
            print(f"  ✓ {rel}: {n} blocks enriched")
        total += n
    print(f"\nTotal: {total} additional font property restorations")


if __name__ == "__main__":
    main()
