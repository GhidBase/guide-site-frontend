import Checklist from "./components/Checklist";
import Main from "./components/Main";
import PageManager from "./components/PageManager";
import PageBuilder from "./components/PageBuilder";
import EditorExample from "./components/TextEditor";
import oldRoutes from "./js/oldRoutes.jsx";
import NotFound from "./components/NotFound.jsx";
import GuardianCosts from "./components/mini-apps/GuardianCosts.jsx";
import ImmortalGuardians from "./components/mini-apps/ImmortalGuardians.jsx";
const env = import.meta.env.VITE_ENV;

const routes = [
    ...oldRoutes,
    {
        path: "*",
        element: <Main />,
        children: [
            { path: ":pageTitle", element: <PageBuilder /> },
            { path: "guardian-upgrade-costs", element: <GuardianCosts /> },
            { path: "immortal-guardians", element: <ImmortalGuardians /> },
            { path: "flea-guide/", element: <Checklist checklistId={1} /> },
            // { path: "page-manager/:pageId", element: <PageBuilder /> }, deprecated

            { path: "editor-test/", element: <EditorExample /> },
            { path: "404/", element: <NotFound /> },
            { path: "*", element: <PageBuilder /> },
        ],
    },
];

if (env == "DEV") {
    routes[routes.length - 1].children.unshift({
        path: "page-manager/",
        element: <PageManager isAdmin={true} />,
    });
}

console.log(routes[routes.length - 1].children);
export default routes;
