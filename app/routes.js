import { route, index, layout } from "@react-router/dev/routes";

export default [
    route("ads.txt", "routes/ads-txt.jsx"),

    // Legacy .html URL redirects (301 server-side)
    route("/pages/:page", "routes/old-pages.jsx"),

    layout("routes/layout.jsx", { id: "main" }, [
        index("routes/home.jsx"),
        route(":pageSlug", "routes/page-slug.jsx"),

        route("games/:gameSlug", "routes/game-layout.jsx", [
            index("routes/game-home.jsx"),
            route(":pageSlug", "routes/game-page.jsx", { id: "game-page-slug" }),
            route("immortal-main", "routes/redirect-immortal-main.jsx", { id: "game-immortal-main" }),
            route("guardian-upgrade-costs", "routes/guardian-costs.jsx", { id: "game-guardian-costs" }),
            route("flea-guide", "routes/flea-guide.jsx"),
            route("board-builder", "routes/board-builder.jsx", { id: "game-board-builder" }),
            route("tier-list", "routes/tier-list.jsx", { id: "game-tier-list" }),
            route("page-manager", "routes/page-manager.jsx", { id: "game-page-manager" }),
            route("game-manager", "routes/game-manager.jsx", { id: "game-game-manager" }),
            route("navigation-panel", "routes/navigation-panel.jsx", { id: "game-navigation-panel" }),
            route("leaderboard", "routes/leaderboard.jsx", { id: "game-leaderboard" }),
            route("comment-overview", "routes/comment-overview.jsx", { id: "game-comment-overview" }),
        ]),

        // Top-level LDG-mode special routes
        route("immortal-main", "routes/redirect-immortal-main.jsx", { id: "top-immortal-main" }),
        route("guardian-upgrade-costs", "routes/guardian-costs.jsx", { id: "top-guardian-costs" }),
        route("board-builder", "routes/board-builder.jsx", { id: "top-board-builder" }),
        route("tier-list", "routes/tier-list.jsx", { id: "top-tier-list" }),

        route("privacy-policy", "routes/privacy-policy.jsx"),
        route("login", "routes/login.jsx"),
        route("signup", "routes/signup.jsx"),
        route("dashboard", "routes/dashboard.jsx"),
        route("access-denied", "routes/access-denied.jsx"),

        route("page-manager", "routes/page-manager.jsx", { id: "top-page-manager" }),
        route("game-manager", "routes/game-manager.jsx", { id: "top-game-manager" }),
        route("leaderboard", "routes/leaderboard.jsx", { id: "top-leaderboard" }),
        route("comment-overview", "routes/comment-overview.jsx", { id: "top-comment-overview" }),

        route("404", "routes/not-found.jsx", { id: "not-found-404" }),
        route("*", "routes/not-found.jsx", { id: "not-found-wildcard" }),
    ]),
];
