export function initializeQuietWidgetToggle(widget, { detailsSelector = ".today-widget-details", toggleSelector } = {}) {
    const details = widget.querySelector(detailsSelector);
    const toggleTarget = toggleSelector ? widget.querySelector(toggleSelector) : widget;
    const setAccessibleState = (expanded) => {
        toggleTarget.setAttribute("aria-expanded", String(expanded));
        details.setAttribute("aria-hidden", String(!expanded));
    };
    const setPinned = (expanded) => {
        widget.classList.toggle("is-expanded", expanded);
        widget.classList.remove("is-hovered");
        setAccessibleState(expanded);
    };
    const togglePinned = () => setPinned(!widget.classList.contains("is-expanded"));

    widget.addEventListener("mouseenter", () => {
        if (!widget.classList.contains("is-expanded")) {
            widget.classList.add("is-hovered");
            setAccessibleState(true);
        }
    });
    widget.addEventListener("mouseleave", () => {
        widget.classList.remove("is-hovered");
        if (!widget.classList.contains("is-expanded")) setAccessibleState(false);
    });
    toggleTarget.addEventListener("click", togglePinned);
    toggleTarget.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            togglePinned();
        }
    });
}