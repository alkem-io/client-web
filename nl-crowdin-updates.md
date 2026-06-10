# Dutch (NL) Crowdin updates — message-house alignment

These changes must be made in **Crowdin** (the NL `translation.nl.json` is Crowdin-managed and
must not be edited directly in the repo). Driver: canonical glossary
`strategy/vault/05-Communications/0-Terminology/translations-nl.md`
→ **Contributor(s) = Deelnemer(s)** (the product currently uses *Bijdrager(s)*).

Scratch artifact — not intended to be committed.

## Group 1 — role noun "Contributor(s)" → "Deelnemer(s)"

| Key | Current NL | Suggested NL |
|---|---|---|
| `common.contributors` | Bijdragers | Deelnemers |
| `pages.titles.contributors` | Bijdragers | Deelnemers |
| `contributors-section.title` | Bijdragers | Deelnemers |
| `dashboard-contributors-section.dialog-title` | Bijdragers | Deelnemers |
| `spaceDialog.contributors` | Bijdragers | Deelnemers |
| `pages.contributors.fullName` | Bijdragers vinden | Deelnemers vinden |
| `pages.contributors.unauthorized` | Log in om de bijdragers van deze $t(common.space) te zien. | Log in om de deelnemers van deze $t(common.space) te zien. |
| `pages.search.subtitle` | Vind de $t(common.spaces), bijdragers, $t(common.subspaces), en inhoud van de openbare $t(common.spaces) hieronder | Vind de $t(common.spaces), deelnemers, $t(common.subspaces), en inhoud van de openbare $t(common.spaces) hieronder |
| `pages.search.filter.type.contributor` | Type bijdrager | Type deelnemer |
| `community.invitations.inviteContributorsDialog.users.validationErrors.required` | Voeg ten minste één bijdrager toe om uit te nodigen | Voeg ten minste één deelnemer toe om uit te nodigen |
| `pages.admin.user.settings.privacy.contributorRolesVisible` | Toon bijdrager rollen aan alle geregistreerde gebruikers | Toon deelnemerrollen aan alle geregistreerde gebruikers |
| `pages.admin.organization.settings.privacy.contributorRolesVisible` | Toon bijdrager rollen aan alle geregistreerde gebruikers | Toon deelnemerrollen aan alle geregistreerde gebruikers |
| `createVirtualContributorWizard.trySection.postDescription` | …Vergelijkbaar met het vermelden van een menselijke bijdrager, kun je het… | …Vergelijkbaar met het vermelden van een menselijke deelnemer, kun je het… |

## Group 2 — quality bugs (independent of the glossary)

| Key | Issue | Fix |
|---|---|---|
| `pages.generic.sections.community.leading-contributors` | "Leading bijdragers" — English "Leading" left untranslated | Leidende deelnemers |
| `pages.accept-terms.introduction` | typo "bijdragers **van van** waar dan ook" | "…deelnemers van waar dan ook…" |

## Deliberately NOT changed (considered, left as-is)

- `pages.admin.spaceConversion.demoteL1ToL2.hint` / `.confirmWarning` — "virtuele bijdragers" is the
  *Virtual Contributor* product concept (AI agents), a separate noun from the human Contributor role.
  The glossary keeps "Virtual Contributor". Leave as-is.
- `components.spaceWelcomeDialog.description` — "Nodig bijdragers uit" translates EN "Invite **collaborators**"
  (not "contributors"), so it is outside the glossary rule. Judgment call.
- Verb uses of *bijdragen* ("beginnen bij te dragen") are correct — unchanged.

## Note
Group 1 is a real semantic shift in-product (NL *deelnemer* = participant, distinct from *lid* = member).
If you'd rather keep *Bijdrager* in the product UI and apply *Deelnemer* only in marketing collateral,
apply **Group 2 only**.
