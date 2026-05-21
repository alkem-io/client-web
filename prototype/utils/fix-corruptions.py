#!/usr/bin/env python3
"""
Fix the corrupted style blocks from the first merge script.
Patterns to fix:
1. Font property lines at column 0 (should be indented inside style block)
2. fontFamily with broken }} placement
3. style={{ followed by broken property on same line
"""
import re
import os

PROTO = "/Users/jeroennijkamp/Documents/Shadcn Ui Redesign Project/Resources/prototype/src"

CORRUPTED_FILES = {
    "app/components/search/SearchOverlay.tsx": [587, 645, 923],
    "app/components/messaging/NewConversationFlow.tsx": [320, 509],
    "app/components/messaging/SpaceChannelView.tsx": [763],
    "app/components/messaging/ConversationList.tsx": [355],
    "app/components/messaging/ChatView.tsx": [338, 339],
    "app/components/messaging/ChatRail.tsx": [315],
    "app/components/analytics/AnalyticsGraphExplorer.tsx": [516, 525],
    "app/components/analytics/ForceGraph.tsx": [849, 876],
    "app/pages/AdminPage.tsx": [87, 88, 205, 206, 212, 213, 215, 216],
    "app/pages/MessagesPage.tsx": [193],
    "app/pages/NotFoundPage.tsx": [19],
}

def fix_file(filepath):
    """
    Fix corrupted style blocks by removing incorrectly inserted font property lines
    and fixing broken style={{ }} syntax.
    """
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    fixed_lines = []
    i = 0
    changes = 0
    
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Pattern 1: Line starts at col 0 with a font property (no leading whitespace)
        # These are incorrectly inserted lines - REMOVE them
        if re.match(r'^(fontSize|fontWeight|fontFamily|letterSpacing):', line) and not line.startswith(' '):
            # This is a corrupted inserted line - check if it contains }} or other syntax
            if '}}' in stripped or '}}>':
                # This line has glued-together content - it's a full broken insertion
                # Try to extract only the valid closing part
                pass
            changes += 1
            i += 1
            continue
        
        # Pattern 2: style={{ followed by font prop and broken }} on same/next lines
        # e.g.: <span style={{               fontFamily: "'Inter', sans-serif" },
        if 'style={{' in line and ("fontFamily:" in line or "fontSize:" in line) and '},' in line:
            # Check if this is a corrupted single-line style that got the prop injected
            # Fix: remove the injected part, restore original
            m = re.match(r'(.*style=\{\{)\s*(fontFamily:.*?)\s*\},', line)
            if m:
                # The original style={{ was broken - try to reconstruct
                # Check what the next line looks like - it might have the original content
                if i + 1 < len(lines):
                    next_stripped = lines[i + 1].strip()
                    if next_stripped.startswith(('fontSize:', 'fontWeight:', 'color:', 'background:')):
                        # Next line is a property - the style block continues
                        # Keep the style={{ opening and remove the bad fontFamily insertion
                        fixed_lines.append(m.group(1).rstrip() + '\n')
                        changes += 1
                        i += 1
                        continue
                # If it was a single-line style={{ ... }}  that got corrupted
                # Just remove the bad fontFamily and fix the closing
                cleaned = re.sub(r'\s*fontFamily:.*?sans-serif["\']?\s*\},?\s*', ' ', line)
                if '}}' not in cleaned:
                    cleaned = cleaned.rstrip() + ' }}\n'
                fixed_lines.append(cleaned)
                changes += 1
                i += 1
                continue
        
        # Pattern 3: Inside a style block, a line with fontFamily that has }} or }, at wrong place
        # e.g.:                                 fontFamily: "'Inter', sans-serif" },
        if re.match(r'\s+fontFamily:.*sans-serif.*\},', stripped):
            # This is a corrupted line - remove it
            changes += 1
            i += 1
            continue
        
        fixed_lines.append(line)
        i += 1
    
    if changes > 0:
        with open(filepath, 'w') as f:
            f.writelines(fixed_lines)
    
    return changes


def main():
    total = 0
    for rel, line_nums in CORRUPTED_FILES.items():
        path = os.path.join(PROTO, rel)
        if os.path.exists(path):
            n = fix_file(path)
            if n > 0:
                print(f"  ✓ {rel}: fixed {n} corruptions")
            total += n
    
    # Also scan ALL tsx files for any remaining col-0 font properties
    for root, dirs, files in os.walk(os.path.join(PROTO, "app")):
        for fname in files:
            if not fname.endswith('.tsx'):
                continue
            fpath = os.path.join(root, fname)
            rel = os.path.relpath(fpath, PROTO)
            if rel in CORRUPTED_FILES:
                continue  # Already processed
            
            with open(fpath, 'r') as f:
                content = f.read()
            
            # Check for col-0 font properties
            if re.search(r'^(fontSize|fontWeight|fontFamily|letterSpacing):', content, re.MULTILINE):
                n = fix_file(fpath)
                if n > 0:
                    print(f"  ✓ {rel}: fixed {n} corruptions (auto-detected)")
                    total += n
    
    print(f"\nTotal: {total} corruptions fixed")


if __name__ == "__main__":
    main()
