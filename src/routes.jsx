import Checklist from "./components/Checklist";
import Main from "./components/Main";
import PageManager from "./components/PageManager";
import PageBuilder from "./components/PageBuilder";
import oldRoutes from "./js/oldRoutes.jsx";
import NotFound from "./components/NotFound.jsx";
import GuardianCosts from "./components/mini-apps/GuardianCosts.jsx";
import ImmortalGuardians from "./components/mini-apps/ImmortalGuardians.jsx";
import GameManager from "./components/GameManager.jsx";
import gameAndPageLoader from "./loaders/gameAndPageLoader.js";
import NavigationPanel from "./components/NavigationPanel.jsx";
const env = import.meta.env.VITE_ENV;
const isLDG = import.meta.env.VITE_LDG == "True";
// Clean up routes, then decide how to use "useGameSlug"

const mainRoute = {
    id: "main",
    path: "/",
    element: <Main />,
    loader: gameAndPageLoader,

    shouldRevalidate: ({ currentParams, nextParams }) =>
        currentParams.gameSlug !== nextParams.gameSlug ||
        currentParams.pageSlug !== nextParams.pageSlug,

    // handle : {title} is used on hard coded routes
    // because they're missing the :pageSlug needed
    // to find the title of the page
    children: [
        { index: true, element: <PageBuilder /> },
        { path: ":pageSlug", element: <PageBuilder /> },
        {
            path: "games/:gameSlug",
            children: [
                {
                    index: true,
                    element: <PageBuilder />,
                },
                {
                    path: ":pageSlug",
                    element: <PageBuilder />,
                },
                {
                    path: "guardian-upgrade-costs",
                    element: <GuardianCosts />,
                    handle: { title: "Upgrade Costs" },
                },
                {
                    path: "immortal-guardians",
                    element: <ImmortalGuardians />,
                    handle: { title: "Immortal Guardians" },
                },
                {
                    path: "flea-guide",
                    element: <Checklist checklistId={1} />,
                    handle: { title: "Flea Guide" },
                },
            ],
        },
        { path: "404/", element: <NotFound />, handle: { title: "404" } },
        { path: "*", element: <NotFound />, handle: { title: "404" } },
    ],
};

const luckyDefenseRoute = {
    id: "main",
    path: "/",
    element: <Main />,
    loader: gameAndPageLoader,

    shouldRevalidate: ({ currentParams, nextParams }) =>
        currentParams.gameSlug !== nextParams.gameSlug ||
        currentParams.pageSlug !== nextParams.pageSlug,

    children: [
        { index: true, element: <PageBuilder /> },
        { path: ":pageSlug", element: <PageBuilder /> },
        {
            path: "guardian-upgrade-costs",
            element: <GuardianCosts />,
            handle: { title: "Upgrade Costs" },
        },
        {
            path: "immortal-guardians",
            element: <ImmortalGuardians />,
            handle: { title: "Immortal Guardians" },
        },
        { path: "404/", element: <NotFound /> },
    ],
};

const curRoute = isLDG ? luckyDefenseRoute : mainRoute;

const routes = [...oldRoutes, curRoute];

if (env == "DEV") {
    const found = isLDG
        ? luckyDefenseRoute
        : mainRoute.children.find((child) => child.path == "games/:gameSlug");
    if (isLDG) {
        luckyDefenseRoute.children.push(
            {
                path: "page-manager/",
                element: <PageManager isAdmin={true} />,
                handle: { title: "Page Manager" },
            },
            {
                path: "game-manager/",
                element: <GameManager isAdmin={true} />,
                handle: { title: "Game Manager" },
            },
        );
    } else {
        mainRoute.children
            .find((child) => child.path == "games/:gameSlug")
            .children.push(
                {
                    path: "page-manager/",
                    element: <PageManager isAdmin={true} />,
                    handle: { title: "Page Manager" },
                },
                {
                    path: "game-manager/",
                    element: <GameManager isAdmin={true} />,
                    handle: { title: "Game Manager" },
                },
                {
                    path: "navigation-panel/",
                    element: <NavigationPanel isAdmin={true} />,
                },
            );

        mainRoute.children.push(
            {
                path: "page-manager/",
                element: <PageManager isAdmin={true} />,
                handle: { title: "Page Manager" },
            },
            {
                path: "game-manager/",
                element: <GameManager isAdmin={true} />,
                handle: { title: "Game Manager" },
            },
            {
                path: "navigation-panel/",
                element: <NavigationPanel isAdmin={true} />,
            },
        );
    }
    routes[routes.length - 1].children.unshift(
        {
            path: "page-manager/",
            element: <PageManager isAdmin={true} />,
        },
        {
            path: "navigation-panel/",
            element: <NavigationPanel isAdmin={true} />,
        },
    );
}

export default routes;
