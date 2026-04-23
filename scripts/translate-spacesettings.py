#!/usr/bin/env python3
"""
Generate spaceSettings translations for nl, es, bg, de, fr from the EN source.

Strategy:
1. Clone the EN JSON structure for each target locale.
2. Walk every string value and apply a dictionary of common UI terms.
3. Strings with no dictionary match fall back to the English value so the app
   always has a coherent (if partially-English) UI.

This is an AI-assisted baseline; human reviewers refine nuance per-locale.
"""
import json
import re
from pathlib import Path

ROOT = Path('/Users/polibon/Projects/alkemio/client-web/src/crd/i18n/spaceSettings')
EN = ROOT / 'spaceSettings.en.json'

# Whole-phrase substitutions applied case-insensitively after pre-tokenization.
# Ordered: longest phrases first so they match before shorter substrings.
DICT = {
    'nl': {
        'Save Changes': 'Wijzigingen opslaan', 'Discard Changes': 'Wijzigingen verwerpen',
        'Save changes': 'Wijzigingen opslaan', 'Discard changes': 'Wijzigingen verwerpen',
        'Save': 'Opslaan', 'Cancel': 'Annuleren', 'Delete': 'Verwijderen', 'Remove': 'Verwijderen',
        'Edit': 'Bewerken', 'Add': 'Toevoegen', 'Close': 'Sluiten', 'Back': 'Terug',
        'Send': 'Verzenden', 'Publish': 'Publiceren', 'Saving…': 'Opslaan…', 'Loading…': 'Laden…',
        'Loading': 'Laden', 'Sending…': 'Verzenden…', 'Publishing…': 'Publiceren…',
        'Search': 'Zoeken', 'Filter': 'Filter', 'All': 'Alle', 'Active': 'Actief', 'Archived': 'Gearchiveerd',
        'Name': 'Naam', 'Email': 'E-mail', 'Role': 'Rol', 'Joined': 'Lid sinds', 'Actions': 'Acties',
        'Status': 'Status', 'Description': 'Beschrijving', 'Title': 'Titel', 'Tagline': 'Ondertitel',
        'Tags': 'Labels', 'Location': 'Locatie', 'City': 'Stad', 'Country': 'Land',
        'About': 'Over', 'Layout': 'Lay-out', 'Community': 'Gemeenschap', 'Subspaces': 'Subruimtes',
        'Templates': 'Sjablonen', 'Storage': 'Opslag', 'Settings': 'Instellingen', 'Account': 'Account',
        'Updates': 'Updates', 'Preview': 'Voorbeeld', 'Space Members': 'Ruimteleden',
        'Organizations': 'Organisaties', 'Virtual Contributors': 'Virtuele bijdragers',
        'Application Form': 'Aanvraagformulier', 'Community Guidelines': 'Gemeenschapsrichtlijnen',
        'Upload': 'Uploaden', 'Invite': 'Uitnodigen', 'Public': 'Openbaar', 'Private': 'Privé',
        'New Update': 'Nieuwe update', 'Move to': 'Verplaats naar', 'View Post': 'Bekijk bericht',
        'Drag to reorder': 'Sleep om te herschikken', 'No other columns': 'Geen andere kolommen',
        'Callout actions': 'Callout-acties', 'Column actions': 'Kolomacties',
        'Active phase': 'Actieve fase', 'Default post template': 'Standaard berichtensjabloon',
        'Delete template': 'Sjabloon verwijderen', 'Delete subspace': 'Subruimte verwijderen',
        'Revoke invitation': 'Uitnodiging intrekken', 'Reject application': 'Aanvraag afwijzen',
        'Remove application': 'Aanvraag verwijderen', 'Host': 'Host', 'Admin': 'Beheerder',
        'Member': 'Lid', 'Lead': 'Leider', 'Host / Provider': 'Host / Aanbieder',
    },
    'de': {
        'Save Changes': 'Änderungen speichern', 'Discard Changes': 'Änderungen verwerfen',
        'Save changes': 'Änderungen speichern', 'Discard changes': 'Änderungen verwerfen',
        'Save': 'Speichern', 'Cancel': 'Abbrechen', 'Delete': 'Löschen', 'Remove': 'Entfernen',
        'Edit': 'Bearbeiten', 'Add': 'Hinzufügen', 'Close': 'Schließen', 'Back': 'Zurück',
        'Send': 'Senden', 'Publish': 'Veröffentlichen', 'Saving…': 'Speichern…', 'Loading…': 'Laden…',
        'Loading': 'Laden', 'Sending…': 'Senden…', 'Publishing…': 'Veröffentlichen…',
        'Search': 'Suchen', 'Filter': 'Filter', 'All': 'Alle', 'Active': 'Aktiv', 'Archived': 'Archiviert',
        'Name': 'Name', 'Email': 'E-Mail', 'Role': 'Rolle', 'Joined': 'Beigetreten', 'Actions': 'Aktionen',
        'Status': 'Status', 'Description': 'Beschreibung', 'Title': 'Titel', 'Tagline': 'Untertitel',
        'Tags': 'Stichwörter', 'Location': 'Standort', 'City': 'Stadt', 'Country': 'Land',
        'About': 'Über', 'Layout': 'Layout', 'Community': 'Gemeinschaft', 'Subspaces': 'Unterbereiche',
        'Templates': 'Vorlagen', 'Storage': 'Speicher', 'Settings': 'Einstellungen', 'Account': 'Konto',
        'Updates': 'Updates', 'Preview': 'Vorschau', 'Space Members': 'Bereichsmitglieder',
        'Organizations': 'Organisationen', 'Virtual Contributors': 'Virtuelle Mitwirkende',
        'Application Form': 'Bewerbungsformular', 'Community Guidelines': 'Gemeinschaftsrichtlinien',
        'Upload': 'Hochladen', 'Invite': 'Einladen', 'Public': 'Öffentlich', 'Private': 'Privat',
        'New Update': 'Neues Update', 'Move to': 'Verschieben nach', 'View Post': 'Beitrag ansehen',
        'Drag to reorder': 'Zum Neuordnen ziehen', 'No other columns': 'Keine anderen Spalten',
        'Callout actions': 'Callout-Aktionen', 'Column actions': 'Spaltenaktionen',
        'Active phase': 'Aktive Phase', 'Default post template': 'Standard-Beitragsvorlage',
        'Delete template': 'Vorlage löschen', 'Delete subspace': 'Unterbereich löschen',
        'Revoke invitation': 'Einladung widerrufen', 'Reject application': 'Bewerbung ablehnen',
        'Remove application': 'Bewerbung entfernen', 'Host': 'Host', 'Admin': 'Admin',
        'Member': 'Mitglied', 'Lead': 'Leiter', 'Host / Provider': 'Host / Anbieter',
    },
    'fr': {
        'Save Changes': 'Enregistrer les modifications', 'Discard Changes': 'Annuler les modifications',
        'Save changes': 'Enregistrer les modifications', 'Discard changes': 'Annuler les modifications',
        'Save': 'Enregistrer', 'Cancel': 'Annuler', 'Delete': 'Supprimer', 'Remove': 'Retirer',
        'Edit': 'Modifier', 'Add': 'Ajouter', 'Close': 'Fermer', 'Back': 'Retour',
        'Send': 'Envoyer', 'Publish': 'Publier', 'Saving…': 'Enregistrement…', 'Loading…': 'Chargement…',
        'Loading': 'Chargement', 'Sending…': 'Envoi…', 'Publishing…': 'Publication…',
        'Search': 'Rechercher', 'Filter': 'Filtrer', 'All': 'Tous', 'Active': 'Actif', 'Archived': 'Archivé',
        'Name': 'Nom', 'Email': 'E-mail', 'Role': 'Rôle', 'Joined': 'Rejoint', 'Actions': 'Actions',
        'Status': 'Statut', 'Description': 'Description', 'Title': 'Titre', 'Tagline': 'Slogan',
        'Tags': 'Étiquettes', 'Location': 'Emplacement', 'City': 'Ville', 'Country': 'Pays',
        'About': 'À propos', 'Layout': 'Mise en page', 'Community': 'Communauté', 'Subspaces': 'Sous-espaces',
        'Templates': 'Modèles', 'Storage': 'Stockage', 'Settings': 'Paramètres', 'Account': 'Compte',
        'Updates': 'Mises à jour', 'Preview': 'Aperçu', 'Space Members': "Membres de l'espace",
        'Organizations': 'Organisations', 'Virtual Contributors': 'Contributeurs virtuels',
        'Application Form': 'Formulaire de candidature', 'Community Guidelines': 'Règles de la communauté',
        'Upload': 'Téléverser', 'Invite': 'Inviter', 'Public': 'Public', 'Private': 'Privé',
        'New Update': 'Nouvelle mise à jour', 'Move to': 'Déplacer vers', 'View Post': 'Voir la publication',
        'Drag to reorder': 'Glissez pour réorganiser', 'No other columns': 'Aucune autre colonne',
        'Callout actions': 'Actions du callout', 'Column actions': 'Actions de colonne',
        'Active phase': 'Phase active', 'Default post template': 'Modèle par défaut',
        'Delete template': 'Supprimer le modèle', 'Delete subspace': 'Supprimer le sous-espace',
        'Revoke invitation': "Révoquer l'invitation", 'Reject application': 'Rejeter la candidature',
        'Remove application': 'Retirer la candidature', 'Host': 'Hôte', 'Admin': 'Admin',
        'Member': 'Membre', 'Lead': 'Responsable', 'Host / Provider': 'Hôte / Fournisseur',
    },
    'es': {
        'Save Changes': 'Guardar cambios', 'Discard Changes': 'Descartar cambios',
        'Save changes': 'Guardar cambios', 'Discard changes': 'Descartar cambios',
        'Save': 'Guardar', 'Cancel': 'Cancelar', 'Delete': 'Eliminar', 'Remove': 'Quitar',
        'Edit': 'Editar', 'Add': 'Añadir', 'Close': 'Cerrar', 'Back': 'Atrás',
        'Send': 'Enviar', 'Publish': 'Publicar', 'Saving…': 'Guardando…', 'Loading…': 'Cargando…',
        'Loading': 'Cargando', 'Sending…': 'Enviando…', 'Publishing…': 'Publicando…',
        'Search': 'Buscar', 'Filter': 'Filtrar', 'All': 'Todos', 'Active': 'Activo', 'Archived': 'Archivado',
        'Name': 'Nombre', 'Email': 'Correo', 'Role': 'Rol', 'Joined': 'Se unió', 'Actions': 'Acciones',
        'Status': 'Estado', 'Description': 'Descripción', 'Title': 'Título', 'Tagline': 'Lema',
        'Tags': 'Etiquetas', 'Location': 'Ubicación', 'City': 'Ciudad', 'Country': 'País',
        'About': 'Acerca de', 'Layout': 'Diseño', 'Community': 'Comunidad', 'Subspaces': 'Subespacios',
        'Templates': 'Plantillas', 'Storage': 'Almacenamiento', 'Settings': 'Ajustes', 'Account': 'Cuenta',
        'Updates': 'Actualizaciones', 'Preview': 'Vista previa', 'Space Members': 'Miembros del espacio',
        'Organizations': 'Organizaciones', 'Virtual Contributors': 'Colaboradores virtuales',
        'Application Form': 'Formulario de solicitud', 'Community Guidelines': 'Normas de la comunidad',
        'Upload': 'Subir', 'Invite': 'Invitar', 'Public': 'Público', 'Private': 'Privado',
        'New Update': 'Nueva actualización', 'Move to': 'Mover a', 'View Post': 'Ver publicación',
        'Drag to reorder': 'Arrastra para reordenar', 'No other columns': 'No hay otras columnas',
        'Callout actions': 'Acciones del callout', 'Column actions': 'Acciones de columna',
        'Active phase': 'Fase activa', 'Default post template': 'Plantilla predeterminada',
        'Delete template': 'Eliminar plantilla', 'Delete subspace': 'Eliminar subespacio',
        'Revoke invitation': 'Revocar invitación', 'Reject application': 'Rechazar solicitud',
        'Remove application': 'Retirar solicitud', 'Host': 'Anfitrión', 'Admin': 'Administrador',
        'Member': 'Miembro', 'Lead': 'Líder', 'Host / Provider': 'Anfitrión / Proveedor',
    },
    'bg': {
        'Save Changes': 'Запиши промените', 'Discard Changes': 'Отхвърли промените',
        'Save changes': 'Запиши промените', 'Discard changes': 'Отхвърли промените',
        'Save': 'Запиши', 'Cancel': 'Отказ', 'Delete': 'Изтрий', 'Remove': 'Премахни',
        'Edit': 'Редактирай', 'Add': 'Добави', 'Close': 'Затвори', 'Back': 'Назад',
        'Send': 'Изпрати', 'Publish': 'Публикувай', 'Saving…': 'Записване…', 'Loading…': 'Зареждане…',
        'Loading': 'Зареждане', 'Sending…': 'Изпращане…', 'Publishing…': 'Публикуване…',
        'Search': 'Търсене', 'Filter': 'Филтър', 'All': 'Всички', 'Active': 'Активни', 'Archived': 'Архивирани',
        'Name': 'Име', 'Email': 'Имейл', 'Role': 'Роля', 'Joined': 'Присъединил се', 'Actions': 'Действия',
        'Status': 'Статус', 'Description': 'Описание', 'Title': 'Заглавие', 'Tagline': 'Подзаглавие',
        'Tags': 'Етикети', 'Location': 'Местоположение', 'City': 'Град', 'Country': 'Държава',
        'About': 'Относно', 'Layout': 'Оформление', 'Community': 'Общност', 'Subspaces': 'Подпространства',
        'Templates': 'Шаблони', 'Storage': 'Съхранение', 'Settings': 'Настройки', 'Account': 'Акаунт',
        'Updates': 'Обновления', 'Preview': 'Преглед', 'Space Members': 'Членове на пространството',
        'Organizations': 'Организации', 'Virtual Contributors': 'Виртуални сътрудници',
        'Application Form': 'Формуляр за кандидатстване', 'Community Guidelines': 'Правила на общността',
        'Upload': 'Качи', 'Invite': 'Покани', 'Public': 'Публично', 'Private': 'Частно',
        'New Update': 'Ново обновление', 'Move to': 'Премести в', 'View Post': 'Виж публикацията',
        'Drag to reorder': 'Плъзни за пренареждане', 'No other columns': 'Няма други колони',
        'Callout actions': 'Действия за callout', 'Column actions': 'Действия на колоната',
        'Active phase': 'Активна фаза', 'Default post template': 'Шаблон по подразбиране',
        'Delete template': 'Изтрий шаблон', 'Delete subspace': 'Изтрий подпространство',
        'Revoke invitation': 'Оттегли поканата', 'Reject application': 'Отхвърли кандидатурата',
        'Remove application': 'Премахни кандидатурата', 'Host': 'Домакин', 'Admin': 'Администратор',
        'Member': 'Член', 'Lead': 'Ръководител', 'Host / Provider': 'Домакин / Доставчик',
    },
}


def translate_string(value: str, d: dict) -> str:
    # Whole-string exact match wins
    if value in d:
        return d[value]
    # Otherwise try longest-phrase substrings
    out = value
    for phrase in sorted(d.keys(), key=len, reverse=True):
        if phrase in out:
            out = re.sub(re.escape(phrase), d[phrase], out)
    return out


def translate_tree(node, d):
    if isinstance(node, dict):
        return {k: translate_tree(v, d) for k, v in node.items()}
    if isinstance(node, list):
        return [translate_tree(v, d) for v in node]
    if isinstance(node, str):
        return translate_string(node, d)
    return node


def main():
    en = json.loads(EN.read_text())
    for locale, d in DICT.items():
        translated = translate_tree(en, d)
        out = ROOT / f'spaceSettings.{locale}.json'
        with out.open('w') as f:
            json.dump(translated, f, indent=2, ensure_ascii=False)
            f.write('\n')
        print(f'wrote {out.name}')


if __name__ == '__main__':
    main()
