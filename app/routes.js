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
            route("guardian-upgrade-costs", "routes/guardian-costs.jsx", { id: "game-guardian-costs" }),
            route("flea-guide", "routes/flea-guide.jsx"),
            route("page-manager", "routes/page-manager.jsx", { id: "game-page-manager" }),
            route("game-manager", "routes/game-manager.jsx", { id: "game-game-manager" }),
            route("navigation-panel", "routes/navigation-panel.jsx", { id: "game-navigation-panel" }),
            route("leaderboard", "routes/leaderboard.jsx", { id: "game-leaderboard" }),
        ]),

        // Top-level LDG-mode special routes
        route("guardian-upgrade-costs", "routes/guardian-costs.jsx", { id: "top-guardian-costs" }),

        route("login", "routes/login.jsx"),
        route("signup", "routes/signup.jsx"),
        route("dashboard", "routes/dashboard.jsx"),
        route("access-denied", "routes/access-denied.jsx"),

        route("page-manager", "routes/page-manager.jsx", { id: "top-page-manager" }),
        route("game-manager", "routes/game-manager.jsx", { id: "top-game-manager" }),
        route("navigation-panel", "routes/navigation-panel.jsx", { id: "top-navigation-panel" }),
        route("leaderboard", "routes/leaderboard.jsx", { id: "top-leaderboard" }),

        route("404", "routes/not-found.jsx", { id: "not-found-404" }),
        route("*", "routes/not-found.jsx", { id: "not-found-wildcard" }),
    ]),
];
