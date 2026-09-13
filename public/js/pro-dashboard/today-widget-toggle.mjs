export function initializeQuietWidgetToggle(widget) {
    const details = widget.querySelector(".today-widget-details");
    const setAccessibleState = (expanded) => {
        widget.setAttribute("aria-expanded", String(expanded));
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
    widget.addEventListener("click", togglePinned);
    widget.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            togglePinned();
        }
    });
}