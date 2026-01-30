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

const env = import.meta.env.VITE_ENV;
const useLDGRoute = import.meta.env.VITE_LDG == "True";
// Clean up routes, then decide how to use "useGameSlug"

const mainRoute = {
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
        { path: "404/", element: <NotFound /> },
    ],
};

const luckyDefenseRoute = {
    path: "/",
    element: <Main />,
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

const curRoute = useLDGRoute ? luckyDefenseRoute : mainRoute;

const routes = [...oldRoutes, curRoute];

if (env == "DEV") {
    const found = mainRoute.children.find(
        (child) => child.path == "games/:gameSlug",
    );

    found.children.push(
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
}

export default routes;
