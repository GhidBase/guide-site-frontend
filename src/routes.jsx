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
import { Homepage } from "./components/Homepage.jsx";

const env = import.meta.env.VITE_ENV;
const useGameSlug = import.meta.env.VITE_MULTIGAME;

const routes = [
    ...oldRoutes,
    {
        path: "/",
        element: <Main />,
        children: [{ index: true, element: <Homepage /> }],
    },
    {
        path: useGameSlug ? ":gameSlug" : "*",
        element: <Main />,
        children: [
            { index: true, element: <PageBuilder /> },
            { path: ":pageTitle", element: <PageBuilder /> }, // wip
            { path: "guardian-upgrade-costs", element: <GuardianCosts /> },
            { path: "immortal-guardians", element: <ImmortalGuardians /> },
            { path: "flea-guide/", element: <Checklist checklistId={1} /> },
            { path: "editor-test/", element: <EditorExample /> },
            { path: "404/", element: <NotFound /> },
            { path: "*", element: <PageBuilder /> },
        ],
    },
];

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
