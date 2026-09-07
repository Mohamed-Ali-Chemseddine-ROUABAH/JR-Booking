# Documentation Index / Index de documentation

All internal documentation lives under `docs/`. Paths in this file are repository-relative and are the canonical locations future agents and developers must use.

Toute la documentation interne vit sous `docs/`. Les chemins de ce fichier sont relatifs a la racine du depot et sont les emplacements canoniques que les futurs agents et developpeurs doivent utiliser.

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
