import { UI_STRINGS } from "../core/strings-fr.js";
import { debounce, escapeHtml, normalizeSearchTerm } from "../core/utils.js";
import { findPublicProfiles } from "../search/search-professional.js";

const strings = UI_STRINGS.clientDashboard.professionalSearch;

export function initializeProfessionalSearch(container, {
    savedProfessionals = [],
    lockedProId = null,
    lockedDisplayName = null,
    lockedIdTag = null,
    onLock,
    onUnlock,
    onSave,
    onRemove
} = {}) {
    container.innerHTML = `
        <h2>${strings.title}</h2>
        <div class="professional-search-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" data-professional-search-input aria-label="${strings.title}" placeholder="${strings.placeholder}">
        </div>
        <div class="professional-search-results" data-professional-search-results aria-live="polite"></div>
        ${renderChips(savedProfessionals, lockedProId, lockedDisplayName, lockedIdTag)}
    `;

    const input = container.querySelector("[data-professional-search-input]");
    const results = container.querySelector("[data-professional-search-results]");

    const runSearch = debounce(async () => {
        const term = normalizeSearchTerm(input.value || "");
        if (!term) {
            results.innerHTML = "";
            return;
        }
        const profiles = await findPublicProfiles(term);
        results.innerHTML = profiles.length
            ? profiles.map((profile) => renderResult(profile, savedProfessionals)).join("")
            : `<p class="professional-search-empty">${strings.noResults}</p>`;
    }, 300);

    input.addEventListener("input", runSearch);

    results.addEventListener("click", (event) => {
        const lockButton = event.target.closest("[data-lock-pro]");
        if (lockButton) {
            onLock?.(lockButton.dataset.lockPro, lockButton.dataset.displayName, lockButton.dataset.idTag);
            input.value = "";
            results.innerHTML = "";
            return;
        }
        const saveButton = event.target.closest("[data-save-pro]");
        if (saveButton) {
            onSave?.(saveButton.dataset.savePro, saveButton.dataset.displayName, saveButton.dataset.idTag);
        }
    });

    container.querySelector("[data-professional-chips]")?.addEventListener("click", (event) => {
        const favoriteButton = event.target.closest("[data-toggle-favorite]");
        if (favoriteButton) {
            if (favoriteButton.classList.contains("is-favorited")) {
                onRemove?.(favoriteButton.dataset.toggleFavorite);
            } else {
                onSave?.(favoriteButton.dataset.toggleFavorite, favoriteButton.dataset.displayName, favoriteButton.dataset.idTag);
            }
            return;
        }
        const chip = event.target.closest("[data-chip-pro]");
        if (!chip) return;
        if (chip.classList.contains("is-locked")) {
            onUnlock?.();
        } else {
            onLock?.(chip.dataset.chipPro, chip.dataset.displayName, chip.dataset.idTag);
        }
    });
}

function renderResult(profile, savedProfessionals) {
    const name = escapeHtml(profile.displayName || profile.name || strings.title);
    const idTag = escapeHtml(profile.idTag || profile.id);
    const title = `${strings.idLabel} ${profile.idTag ? "#" + idTag : idTag}`;
    const alreadySaved = savedProfessionals.some((item) => item.proId === profile.id);
    const saveButton = alreadySaved
        ? ""
        : `<button type="button" class="btn btn-ghost" data-save-pro="${profile.id}" data-display-name="${name}" data-id-tag="${idTag}">${strings.save}</button>`;
    return `<article class="professional-search-result" title="${title}"><span><strong>${name}</strong></span><span class="professional-search-actions"><button type="button" class="btn btn-solid" data-lock-pro="${profile.id}" data-display-name="${name}" data-id-tag="${idTag}">${strings.lock}</button>${saveButton}</span></article>`;
}

const LOCK_ICON = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;
const HEART_PATH = "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z";

function renderChips(savedProfessionals, lockedProId, lockedDisplayName, lockedIdTag) {
    const chipList = [...savedProfessionals];
    if (lockedProId && !chipList.some((item) => item.proId === lockedProId)) {
        chipList.push({ proId: lockedProId, displayName: lockedDisplayName, idTag: lockedIdTag, adHoc: true });
    }
    if (!chipList.length) {
        return `<p class="professional-saved-empty">${strings.savedEmpty}</p>`;
    }
    const chips = chipList.map((item) => {
        const name = escapeHtml(item.displayName || strings.title);
        const idTag = escapeHtml(item.idTag || item.proId);
        const title = `${strings.idLabel} ${item.idTag ? "#" + idTag : idTag}`;
        const isLocked = item.proId === lockedProId;
        const isFavorited = !item.adHoc;
        const lockIcon = isLocked ? LOCK_ICON : "";
        const heartButton = `<button type="button" class="professional-chip-heart${isFavorited ? " is-favorited" : ""}" data-toggle-favorite="${item.proId}" data-display-name="${name}" data-id-tag="${idTag}" aria-label="${isFavorited ? strings.unfavorite : strings.favorite}"><svg viewBox="0 0 24 24" width="14" height="14" fill="${isFavorited ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="${HEART_PATH}"/></svg></button>`;
        return `<span class="professional-chip${isLocked ? " is-locked" : ""}" data-chip-pro="${item.proId}" data-display-name="${name}" data-id-tag="${idTag}" title="${title}">${lockIcon}${name}${heartButton}</span>`;
    }).join("");
    return `<div class="professional-saved-chips" data-professional-chips>${chips}</div>`;
}
