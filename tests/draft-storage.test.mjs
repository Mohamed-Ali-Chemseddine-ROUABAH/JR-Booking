import assert from "node:assert/strict";
import test from "node:test";
import { clearDraft, loadDraft, saveDraft } from "../public/js/core/draft-storage.mjs";

function storage() {
    const values = new Map();
    return { setItem: (key, value) => values.set(key, value), getItem: (key) => values.get(key) || null, removeItem: (key) => values.delete(key) };
}

test("saves, restores, and clears a local draft", () => {
    const localStorage = storage();
    assert.equal(saveDraft("draft", { startTime: "10:00" }, localStorage), true);
    assert.deepEqual(loadDraft("draft", localStorage), { startTime: "10:00" });
    assert.equal(clearDraft("draft", localStorage), true);
    assert.equal(loadDraft("draft", localStorage), null);
});

test("ignores malformed drafts instead of breaking the form", () => {
    const localStorage = storage();
    localStorage.setItem("draft", "not-json");
    assert.equal(loadDraft("draft", localStorage), null);
});