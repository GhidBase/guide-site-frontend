const isLDG = import.meta.env.VITE_LDG == "True";

{
    if (state.built) return;

    // Create centered panel

    // Header with search
    const header = document.createElement("div");
    header.className = "mobile-menu-header";

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search articles…";
    searchInput.className = "mobile-menu-search";

    const closeBtn = document.createElement("button");
    closeBtn.className = "mobile-menu-close";
    closeBtn.textContent = "Close";

    header.appendChild(searchInput);
    header.appendChild(closeBtn);

    // Categories container
    const categoriesContainer = document.createElement("div");
    categoriesContainer.className = "mobile-menu-categories";

    // Persistent area (discord + copyright + donate)
    const persistentArea = document.createElement("div");
    persistentArea.className = "mobile-menu-persistent";

    panel.appendChild(header);

    // feedback container for search
    const feedback = document.createElement("div");
    feedback.className = "mobile-menu-feedback";
    feedback.style.display = "none";
    feedback.textContent = "";

    panel.appendChild(feedback);

    panel.appendChild(categoriesContainer);
    panel.appendChild(persistentArea);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    // Save refs
    state.elements.overlay = overlay;
    state.elements.panel = panel;
    state.elements.header = header;
    state.elements.searchInput = searchInput;
    state.elements.categoriesContainer = categoriesContainer;
    state.elements.persistentArea = persistentArea;
    state.elements.closeBtn = closeBtn;
    state.elements.feedback = feedback;

    // Close handlers
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) hideMenu();
    });
    closeBtn.addEventListener("click", hideMenu);

    // Build categories from sidebar once loaded
    buildCategoriesFromSidebar();

    // Search behavior
    searchInput.addEventListener("input", onSearchChange);

    state.built = true;
}

export default function Navbar({}) {
    return (
        <div className="mobile-menu-overlay">
            <div className="mobile-menu-panel surface">
                <div className="mobile-menu-header"></div>
                <div className="mobile-menu-feedback"></div>
                <div className="mobile-menu-categories"></div>
            </div>
        </div>
    );

    const panel = document.createElement("div");
    panel.className = "mobile-menu-panel surface";
}
