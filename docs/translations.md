# Translation Guide

This guide explains how to manage translations in the Alkemio client-web project.

## Quick Start

### Using AI Translation (Recommended)

The fastest way to translate new strings is using the AI translation agent:

1. **Add your English strings** to `src/core/i18n/en/translation.en.json`
2. **Open GitHub Copilot Chat** (Cmd+Shift+I / Ctrl+Shift+I)
3. **Run the command**: `@workspace /alkemio.translate`
4. **Review and commit** the generated translations

The AI agent will automatically:

- Sync missing keys to all language files
- Translate each string with cultural and linguistic accuracy
- Preserve variables like `{{name}}` and HTML tags
- Apply language-specific guidelines

### Manual Translation

If you prefer to translate manually:

1. **Add your English string** to `src/core/i18n/en/translation.en.json`
2. **Run the sync script**: `./.scripts/add_missing_translation_keys.sh`
3. **Translate the placeholders** marked as `[AI_TRANSLATE]` in each language file

## Supported Languages

| Code | Language   | Notes                                 |
| ---- | ---------- | ------------------------------------- |
| `en` | English    | Source of truth - never auto-modified |
| `de` | German     | Formal (Sie) form                     |
| `es` | Spanish    | Neutral Spanish                       |
| `fr` | French     | Formal (vous) form                    |
| `nl` | Dutch      | Standard Dutch                        |
| `pt` | Portuguese | European Portuguese                   |
| `bg` | Bulgarian  | Formal Bulgarian                      |
| `no` | Norwegian  | Formal Norwegian                      |

## Translation Files

All translation files are located in `src/core/i18n/`:

```text
src/core/i18n/
├── en/translation.en.json    (source of truth)
├── de/translation.de.json
├── es/translation.es.json
├── fr/translation.fr.json
├── nl/translation.nl.json
├── pt/translation.pt.json
├── bg/translation.bg.json
└── no/translation.no.json
```

## Best Practices

### 1. Preserve Variables

Always keep variable placeholders intact:

```json
// ✅ Correct
"welcome": "Welcome {{name}} to Alkemio"
"welcome": "Bienvenue {{name}} chez Alkemio"

// ❌ Wrong
"welcome": "Bienvenue nom chez Alkemio"
```

### 2. Maintain HTML Tags

Keep all HTML formatting:

```json
// ✅ Correct
"terms": "I accept the <a>terms and conditions</a>"
"terms": "J'accepte les <a>conditions générales</a>"

// ❌ Wrong
"terms": "J'accepte les conditions générales"
```

### 3. Use Consistent Terminology

Use the same translation for technical terms throughout the app. Check existing translations for consistency.

### 4. Check Context

Review similar strings to understand:

- The appropriate formality level
- How similar phrases are translated
- Common patterns in that language

## Common Translation Patterns

### Action Buttons

| English | German     | Spanish  | French      | Dutch       |
| ------- | ---------- | -------- | ----------- | ----------- |
| Create  | Erstellen  | Crear    | Créer       | Aanmaken    |
| Edit    | Bearbeiten | Editar   | Modifier    | Bewerken    |
| Delete  | Löschen    | Eliminar | Supprimer   | Verwijderen |
| Save    | Speichern  | Guardar  | Enregistrer | Opslaan     |
| Cancel  | Abbrechen  | Cancelar | Annuler     | Annuleren   |

### Common UI Elements

- **Dashboard** → Usually kept as "Dashboard" in most languages
- **Settings** → Einstellungen (de), Configuración (es), Paramètres (fr), Instellingen (nl)
- **Profile** → Profil (de), Perfil (es), Profil (fr), Profiel (nl)
- **Search** → Suchen (de), Buscar (es), Rechercher (fr), Zoeken (nl)

## Testing Translations

After adding translations:

1. **Change language** in the app to verify translations appear correctly
2. **Check for missing translations** - they typically show the key name or fallback text
3. **Verify formatting** - ensure line breaks, bold text, and links work properly
4. **Test with variables** - if the key uses variables, test with actual data

## Troubleshooting

### Script Issues

**Problem**: Script doesn't run

```bash
# Make it executable
chmod +x ./.scripts/add_missing_translation_keys.sh
```

**Problem**: Script requires jq

```bash
# Install jq (required for JSON processing)
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq
```

### Translation Issues

**Problem**: AI agent not responding

- Restart VS Code after adding agent configuration
- Verify GitHub Copilot extension is installed and signed in

**Problem**: Variables broken after translation

- Check that `{{variable}}` patterns match exactly with the English version

## Tools

### Sync Script

**Location**: `.scripts/add_missing_translation_keys.sh`

Synchronizes translation keys from English to all other languages, adding `[AI_TRANSLATE]` placeholders for missing keys.

### AI Translation Agent

**Command**: `@workspace /alkemio.translate`

Automated translation using GitHub Copilot with language-specific guidelines.
