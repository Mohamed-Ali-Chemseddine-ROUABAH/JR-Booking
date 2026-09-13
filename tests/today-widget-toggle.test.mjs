import assert from "node:assert/strict";
import test from "node:test";

import { initializeQuietWidgetToggle } from "../public/js/pro-dashboard/today-widget-toggle.mjs";

class ClassList {
    values = new Set();

    add(value) { this.values.add(value); }
    remove(value) { this.values.delete(value); }
    contains(value) { return this.values.has(value); }
    toggle(value, force) { force ? this.add(value) : this.remove(value); }
}

class FakeElement extends EventTarget {
    constructor(details = null) {
        super();
        this.classList = new ClassList();
        this.details = details;
        this.attributes = new Map();
    }

    querySelector(selector) { return selector === ".today-widget-details" ? this.details : null; }
    setAttribute(name, value) { this.attributes.set(name, value); }
    getAttribute(name) { return this.attributes.get(name); }
}

function keyboardEvent(key) {
    const event = new Event("keydown", { cancelable: true });
    Object.defineProperty(event, "key", { value: key });
    return event;
}

test("quiet widget opens temporarily on hover", () => {
    const details = new FakeElement();
    const widget = new FakeElement(details);
    initializeQuietWidgetToggle(widget);

    widget.dispatchEvent(new Event("mouseenter"));
    assert.equal(widget.classList.contains("is-hovered"), true);
    assert.equal(widget.getAttribute("aria-expanded"), "true");
    assert.equal(details.getAttribute("aria-hidden"), "false");

    widget.dispatchEvent(new Event("mouseleave"));
    assert.equal(widget.classList.contains("is-hovered"), false);
    assert.equal(widget.getAttribute("aria-expanded"), "false");
    assert.equal(details.getAttribute("aria-hidden"), "true");
});

test("click pins the widget open and toggles it closed", () => {
    const details = new FakeElement();
    const widget = new FakeElement(details);
    initializeQuietWidgetToggle(widget);

    widget.dispatchEvent(new Event("mouseenter"));
    widget.dispatchEvent(new Event("click"));
    assert.equal(widget.classList.contains("is-expanded"), true);
    assert.equal(widget.classList.contains("is-hovered"), false);

    widget.dispatchEvent(new Event("mouseleave"));
    assert.equal(widget.getAttribute("aria-expanded"), "true");

    widget.dispatchEvent(new Event("click"));
    assert.equal(widget.classList.contains("is-expanded"), false);
    assert.equal(widget.getAttribute("aria-expanded"), "false");
});

test("Enter and Space toggle the pinned state", () => {
    const details = new FakeElement();
    const widget = new FakeElement(details);
    initializeQuietWidgetToggle(widget);

    const enter = keyboardEvent("Enter");
    widget.dispatchEvent(enter);
    assert.equal(enter.defaultPrevented, true);
    assert.equal(widget.classList.contains("is-expanded"), true);

    const space = keyboardEvent(" ");
    widget.dispatchEvent(space);
    assert.equal(space.defaultPrevented, true);
    assert.equal(widget.classList.contains("is-expanded"), false);
});