#!/bin/bash

###############################################################################
# Alkemio Translation Key Synchronization Script
#
# Purpose: Ensures all translation keys from the English (en) translation file
#          are present in all other language translation files.
#
# Usage: ./add_missing_translation_keys.sh
#
# What it does:
# 1. Reads the English translation file (translation.en.json) as the source of truth
# 2. For each other language directory (de, es, fr, nl, pt, bg, ach)
# 3. Identifies missing keys in the target language file
# 4. Adds missing keys with a placeholder value: "[AI_TRANSLATE]"
# 5. Preserves existing translations and JSON structure
###############################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$(cd "$SCRIPT_DIR/../src/core/i18n" && pwd)"
EN_FILE="$I18N_DIR/en/translation.en.json"

# Language codes (excluding English)
LANGUAGES=("de" "es" "fr" "nl" "pt" "bg" "ach")

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed or not in PATH${NC}"
    exit 1
fi

# Check if jq is available (optional but recommended)
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}Warning: jq is not installed. Install it for better performance: brew install jq${NC}"
    USE_JQ=false
else
    USE_JQ=true
fi

# Verify English translation file exists
if [ ! -f "$EN_FILE" ]; then
    echo -e "${RED}Error: English translation file not found at: $EN_FILE${NC}"
    exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Alkemio Translation Key Synchronization${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Source file: ${GREEN}$EN_FILE${NC}"
echo ""

# Function to get all JSON keys (dot notation paths)
get_all_keys() {
    local file=$1
    node -e "
        const fs = require('fs');
        const json = JSON.parse(fs.readFileSync('$file', 'utf8'));

        function getAllKeys(obj, prefix = '') {
            let keys = [];
            for (let key in obj) {
                const newKey = prefix ? \`\${prefix}.\${key}\` : key;
                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    keys = keys.concat(getAllKeys(obj[key], newKey));
                } else {
                    keys.push(newKey);
                }
            }
            return keys;
        }

        const keys = getAllKeys(json);
        console.log(JSON.stringify(keys));
    "
}

# Function to check if key exists in JSON file
key_exists() {
    local file=$1
    local key=$2
    node -e "
        const fs = require('fs');
        const json = JSON.parse(fs.readFileSync('$file', 'utf8'));

        const keys = '$key'.split('.');
        let current = json;

        for (let key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                process.exit(1);
            }
        }
        process.exit(0);
    " 2>/dev/null
}

# Function to add missing key to JSON file
add_key_to_json() {
    local file=$1
    local key=$2
    local value=$3

    node -e "
        const fs = require('fs');
        const json = JSON.parse(fs.readFileSync('$file', 'utf8'));

        const keys = '$key'.split('.');
        let current = json;

        // Navigate to the parent object
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!(k in current) || typeof current[k] !== 'object' || Array.isArray(current[k])) {
                current[k] = {};
            }
            current = current[k];
        }

        // Set the value
        const lastKey = keys[keys.length - 1];
        if (!(lastKey in current)) {
            current[lastKey] = '$value';
        }

        // Write back with proper formatting (2-space indentation)
        fs.writeFileSync('$file', JSON.stringify(json, null, 2) + '\n', 'utf8');
    "
}

# Get all keys from English file
echo -e "${BLUE}Analyzing English translation file...${NC}"
EN_KEYS=$(get_all_keys "$EN_FILE")
EN_KEYS_ARRAY=$(echo "$EN_KEYS" | node -e "console.log(JSON.parse(require('fs').readFileSync(0, 'utf-8')).join(' '))")

TOTAL_KEYS=$(echo "$EN_KEYS" | node -e "console.log(JSON.parse(require('fs').readFileSync(0, 'utf-8')).length)")
echo -e "Found ${GREEN}$TOTAL_KEYS${NC} translation keys in English file"
echo ""

# Process each language
TOTAL_ADDED=0

for lang in "${LANGUAGES[@]}"; do
    LANG_FILE="$I18N_DIR/$lang/translation.$lang.json"

    if [ ! -f "$LANG_FILE" ]; then
        echo -e "${YELLOW}Warning: Translation file not found for language '$lang': $LANG_FILE${NC}"
        echo -e "${YELLOW}Skipping...${NC}"
        echo ""
        continue
    fi

    echo -e "${BLUE}Processing language: ${GREEN}$lang${NC}"
    echo -e "Target file: $LANG_FILE"

    MISSING_COUNT=0
    MISSING_KEYS=()

    # Check each key
    for key in $EN_KEYS_ARRAY; do
        if ! key_exists "$LANG_FILE" "$key"; then
            MISSING_KEYS+=("$key")
            ((MISSING_COUNT++))
        fi
    done

    if [ $MISSING_COUNT -eq 0 ]; then
        echo -e "${GREEN}✓ No missing keys${NC}"
    else
        echo -e "${YELLOW}Found $MISSING_COUNT missing key(s)${NC}"

        # Add missing keys
        for key in "${MISSING_KEYS[@]}"; do
            echo -e "  ${YELLOW}+${NC} Adding key: $key"
            add_key_to_json "$LANG_FILE" "$key" "[AI_TRANSLATE]"
        done

        echo -e "${GREEN}✓ Added $MISSING_COUNT key(s) to $lang translation file${NC}"
        TOTAL_ADDED=$((TOTAL_ADDED + MISSING_COUNT))
    fi

    echo ""
done

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Total keys in English file: ${GREEN}$TOTAL_KEYS${NC}"
echo -e "Total keys added across all languages: ${GREEN}$TOTAL_ADDED${NC}"

if [ $TOTAL_ADDED -gt 0 ]; then
    echo -e "${YELLOW}⚠ Please run '/alkemio.translate' in VS Code to translate the placeholder keys${NC}"
else
    echo -e "${GREEN}✓ All translation files are synchronized!${NC}"
fi

echo ""
