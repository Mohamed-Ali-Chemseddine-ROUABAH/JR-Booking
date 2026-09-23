# Architecture Documentation / Documentation d'architecture

This folder documents production ownership. Add one Markdown document for every top-level HTML page and every JavaScript module under `public/js/`, using the same relative directory structure and a `.md` extension. For example, `public/js/schedule/schedule-render.js` is documented by `docs/architecture/js/schedule/schedule-render.md`.

Ce dossier documente la responsabilite du code de production. Ajoutez un document Markdown pour chaque page HTML de premier niveau et chaque module JavaScript sous `public/js/`, en utilisant la meme structure de dossiers relative et une extension `.md`. Par exemple, `public/js/schedule/schedule-render.js` est documente par `docs/architecture/js/schedule/schedule-render.md`.

Each architecture document must state its production file, purpose, imports, DOM owner, Firestore and Storage reads/writes, security rules, feature flag, mockup references for user-facing behavior, and matching verification-log entry. Create or update it in the same change as its production file.

Chaque document d'architecture doit indiquer son fichier de production, son objectif, ses imports, son proprietaire DOM, ses lectures/ecritures Firestore et Storage, ses regles de securite, son feature flag, ses references mockup pour le comportement visible et son entree correspondante dans le journal de verification. Creez-le ou mettez-le a jour dans la meme modification que son fichier de production.

Return to [the documentation index](../README.md) to choose another documentation area. Before changing a user-facing flow, read [the mockup reference set](../mockups/README.md).