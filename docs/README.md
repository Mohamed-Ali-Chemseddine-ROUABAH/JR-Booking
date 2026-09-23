# Documentation Index / Index de documentation

All internal documentation lives under `docs/`. Paths in this file are repository-relative and are the canonical locations future agents and developers must use.

Toute la documentation interne vit sous `docs/`. Les chemins de ce fichier sont relatifs a la racine du depot et sont les emplacements canoniques que les futurs agents et developpeurs doivent utiliser.

## Efficient AI Workflow / Workflow IA efficace

All roadmap work follows the token-efficient execution rule in `requirements/MASTER_SPECIFICATION.md`: use targeted reads and focused searches, avoid screenshots or browser inspection unless explicitly requested, validate with focused checks plus one integrated check for the requested outcome, and provide a direct local browser URL for visual checks. Keep exploration narrow while completing the smallest coherent end-to-end batch; do not split related frontend, backend, rules, tests, or documentation work merely because it crosses a phase boundary.

Verification is AI-owned by default. The AI performs all feasible tests, emulator/rules checks, diagnostics, documentation checks, security checks, and local browser-session checks itself. A local browser may be opened to verify live behavior and layout; screenshots are avoided unless direct DOM/accessibility inspection and interaction cannot establish the visual result. Human action is requested only for genuinely external or human-only checks.

## Progress tracking

Use `requirements/SETUP_CHECKLIST.md` as the fast visual phase dashboard: `[x]` means implemented and locally verified, `[~]` means substantially implemented with verification or release gates remaining, and `[ ]` means meaningful implementation remains. Use `verification/VERIFICATION_LOG.md` as the detailed source for evidence, tests, security/privacy results, browser checks, blockers, and continuation points. This two-layer system is intentional: the checklist answers “where are we?” quickly, while the verification log answers “what proves it?” Do not create a competing status in either file.

## Maximum-progress requests

When the human says `next`, `continue`, `more`, or asks to implement a phase, the AI must select the first unfinished high-value phase from `verification/VERIFICATION_LOG.md` and implement the largest safe coherent batch from it. The AI continues autonomously through all directly required UI, backend, rules/schema, strings, tests, architecture documentation, and verification work. It stops only at a genuine external/human-only action, unresolved requirement or security decision, unavailable dependency, unsafe scope, or exhausted validation context. Optional browser verification is recorded as a blocker or follow-up and must not replace locally possible implementation.

This is the normal deadline-mode behavior: `continue` means keep building the selected phase, not produce one small improvement and wait. The AI should not ask for approval between implementation steps and should not stop after planning, styling, wiring, or a single module when the phase still has locally implementable requirements.

Recommended request:

> Implement the largest safe coherent batch from the next unfinished specification phase. Continue autonomously through UI, backend, rules, tests, documentation, and verification. Do not stop after one small feature or ask for approval between implementation steps. Stop only at a genuine blocker.

For every user-facing schedule change, always use `requirements/MASTER_SPECIFICATION.md`, `mockups/MASTER_MOCKUP.md`, and `mockups/IMPLEMENTATION_REFERENCE.md` together. Professional, client, public-profile, and locked-professional schedules must match the approved mockup by completion; production data and security boundaries must be preserved, and any intentional difference must be documented and verified.

## Completion and Handoff Rule / Regle de fin et de transmission

Every completed feature must be marked in `verification/VERIFICATION_LOG.md` with one explicit status: `DONE` (the AI verified the implementation and no human action is required), `AI VERIFIED - HUMAN CHECK OPTIONAL`, `HUMAN + AI VERIFIED`, or `BLOCKED - EXTERNAL/HUMAN ACTION REQUIRED`. A feature must never remain described only as "implemented" or "pending".

The AI performs all available verification itself: focused tests, emulator/rules checks, syntax and diagnostics checks, documentation checks, and local browser checks when the environment permits them. Human participation is requested only for a check the AI cannot perform, such as a real mailbox, Google consent, a legal decision, or a required external-console action. When human participation is required, the AI gives exactly one small step, waits for the result, records it, and gives the next step.

At every completion handoff, the AI must tell the human what is now done, cite the evidence, identify anything blocked, and name the next coherent outcome that will be developed and tested. Before starting work, the AI reads the current checkpoint and does not redo any feature marked `DONE`, `AI VERIFIED - HUMAN CHECK OPTIONAL`, or `HUMAN + AI VERIFIED` unless a failing regression or an explicit new requirement reopens it. Optional human checks and external blockers do not prevent independent implementation batches from continuing.

## Start Here / Commencer ici

1. [Requirements and roadmap](requirements/MASTER_SPECIFICATION.md) / Exigences et roadmap.
2. [Visual design reference](mockups/MASTER_MOCKUP.md) / Reference du design visuel.
3. [Interactive mockup](mockups/jr-booking-premium-mockup.html) / Mockup interactif.
4. [Mockup extraction guide](mockups/IMPLEMENTATION_REFERENCE.md) / Guide d'extraction du mockup.
5. [Setup checklist](requirements/SETUP_CHECKLIST.md) / Checklist de configuration.
6. [Verification log](verification/VERIFICATION_LOG.md) / Journal de verification.
7. [Architecture documentation](architecture/README.md) / Documentation d'architecture.
8. [External-service setup guides](setup/README.md) / Guides de configuration des services externes.

## Directory Ownership / Responsabilite des dossiers

| Path / Chemin | Contains / Contient | Create future files here when / Creez les futurs fichiers ici lorsque |
| --- | --- | --- |
| `docs/requirements/` | Product requirements, roadmap, setup gates | The document defines what must be built or configured. |
| `docs/mockups/` | Visual guide, interactive HTML mockup, extraction guide | The document defines how a frontend flow must look or behave. |
| `docs/architecture/` | One Markdown file per production HTML/JS module | The document describes a production module's ownership, imports, reads, writes and rules. |
| `docs/verification/` | Human phase verification records | The document records a prepared or completed phase test. |
| `docs/setup/` | External service setup guides | The document explains an external Firebase, Google, or provider configuration task. |

## Future File Rule / Regle pour les futurs fichiers

Before creating a documentation file, choose its owner folder from the table above. Use an English kebab-case filename except the named master files. Add its repository-relative path to the document that requires it and to this index when it is a reusable or mandatory reference. Do not add a duplicate file for the same responsibility; update the existing canonical file instead.

Avant de creer un fichier de documentation, choisissez son dossier proprietaire dans le tableau ci-dessus. Utilisez un nom anglais en kebab-case, sauf pour les fichiers maitres nommes. Ajoutez son chemin relatif a la racine dans le document qui l'exige et dans cet index lorsqu'il devient une reference reutilisable ou obligatoire. Ne creez pas de doublon pour une meme responsabilite : mettez a jour le fichier canonique existant.

For every new production HTML or JavaScript file, create or update its matching architecture document in `docs/architecture/` in the same change. For every new external-provider prerequisite, add or update its guide in `docs/setup/`. For every user-facing change, cite the three mockup references below in its implementation or verification record.

Pour chaque nouveau fichier HTML ou JavaScript de production, creez ou mettez a jour son document d'architecture correspondant dans `docs/architecture/` dans la meme modification. Pour chaque prerequis d'un fournisseur externe, ajoutez ou mettez a jour son guide dans `docs/setup/`. Pour chaque modification visible par un utilisateur, citez les trois references mockup ci-dessous dans son enregistrement d'implementation ou de verification.

## Mockup Relationship / Relation des mockups

`docs/mockups/MASTER_MOCKUP.md` defines visual direction. `docs/mockups/jr-booking-premium-mockup.html` defines the approved interactive prototype. `docs/mockups/IMPLEMENTATION_REFERENCE.md` defines the production extraction path. These three files are complementary and must be read together before changing user-facing frontend behavior.
