import Checklist from "./components/Checklist";
import Main from "./components/Main";
import PageManager from "./components/PageManager";
import PageBuilder from "./components/PageBuilder";
import EditorExample from "./components/TextEditor";
import oldRoutes from "./js/oldRoutes.jsx";
import NotFound from "./components/NotFound.jsx";
import GuardianCosts from "./components/mini-apps/GuardianCosts.jsx";
import ImmortalGuardians from "./components/mini-apps/ImmortalGuardians.jsx";
import GameManager from "./components/GameManager.jsx";

const env = import.meta.env.VITE_ENV;
const useLDGRoute = import.meta.env.VITE_LDG;
// Clean up routes, then decide how to use "useGameSlug"

const mainRoute = {
    path: "/",
    element: <Main />,
    children: [
        { index: true, element: <PageBuilder /> },
        { path: ":pageSlug", element: <PageBuilder /> },
        {
            path: "games/:gameSlug",
            children: [
                { index: true, element: <PageBuilder /> },
                { path: ":pageSlug", element: <PageBuilder /> },
                { path: "404/", element: <NotFound /> },
                {
                    path: "guardian-upgrade-costs",
                    element: <GuardianCosts />,
                },
                {
                    path: "immortal-guardians",
                    element: <ImmortalGuardians />,
                },
                {
                    path: "flea-guide",
                    element: <Checklist checklistId={1} />,
                },
            ],
        },
        { path: "404/", element: <NotFound /> },
        { path: "*", element: <PageBuilder /> },
    ],
};

const luckyDefenseRoute = {
    path: "/",
    element: <Main />,
    children: [
        { index: true, element: <PageBuilder /> },
        { path: ":pageSlug", element: <PageBuilder /> },
        {
            path: "lucky-defense/guardian-upgrade-costs",
            element: <GuardianCosts />,
        },
        {
            path: "lucky-defense/immortal-guardians",
            element: <ImmortalGuardians />,
        },
        { path: "404/", element: <NotFound /> },
        { path: "*", element: <PageBuilder /> },
    ],
};

const curRoute = useLDGRoute ? luckyDefenseRoute : mainRoute;

const routes = [...oldRoutes, curRoute];

// this targets the last object in my route array, which is
// my main route. I should adjust this in the future to
// deliberately target my main route but it works for now
if (env == "DEV") {
    routes[routes.length - 1].children.unshift(
        {
            path: "page-manager/",
            element: <PageManager isAdmin={true} />,
        },
        {
            path: "game-manager/",
            element: <GameManager isAdmin={true} />,
        },
    );
}

export default routes;
