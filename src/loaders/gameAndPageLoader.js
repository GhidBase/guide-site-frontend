import { getAPIForRequest } from "../config/api.js";
import { redirect, isRouteErrorResponse } from "react-router";

export default async function gameAndPageLoader({ params, request }) {
    const { gameSlug, pageSlug } = params;
    const isLDG = new URL(request.url).hostname.includes("luckydefenseguides");
    const currentAPI = getAPIForRequest(request);
    let navbarMap;

    async function safeFetch(url) {
        const response = await fetch(url);
        if (!response.ok) return null;
        return response.json();
    }

    async function fetchPageBySlug() {
        // I need to change the path based on if
        // there's a gameSlug or not
        let path = currentAPI;
        // localhost
        if (!gameData && !!pageSlug) {
            path = path + "/pages/by-slug/" + pageSlug;
        } else if (!!gameData && !!pageSlug) {
            path =
                path + "/games/" + gameData.id + "/pages/by-slug/" + pageSlug;
        }
        const result = await safeFetch(path);
        return result;
    }

    async function fetchGameHomepage() {
        return safeFetch(currentAPI + "/games/" + gameData.id + "/pages/by-slug/" + gameData.slug);
    }

    async function fetchMainHomepage() {
        return safeFetch(currentAPI + "/pages/by-slug/homepage");
    }

    async function fetchGameBySlug(gameSlug) {
        if (gameSlug == undefined) return;
        return safeFetch(currentAPI + "/games/by-slug/" + gameSlug);
    }

    async function fetchNavbar() {
        if (!gameData) {
            return;
        }
        const data = await safeFetch(currentAPI + "/sections/navbar?gameId=" + gameData.id);
        if (!data) return;

        const navbarMap = new Map();
        data.forEach((section) => {
            navbarMap.set(section.id, section);
        });

        return navbarMap;
    }

    // End of the function declarations

    let gameData;
    let pageData;
    let isHomePage = false;
    if (isLDG) {
        gameData = await fetchGameBySlug("lucky-defense");

        if (!!pageSlug) {
            pageData = await fetchPageBySlug();
        }

        // if !!gameData && !pageSlug
        // fetchGameHomepage
        if (!!gameData && !pageSlug) {
            pageData = await fetchGameHomepage();
        }
    } else {
        if (gameSlug != null && gameSlug != undefined) {
            gameData = await fetchGameBySlug(gameSlug);
            if (!gameData) throw redirect("/404");
        }

        if (!!pageSlug) {
            pageData = await fetchPageBySlug();
        }

        // if !!gameData && !pageSlug
        // fetchGameHomepage
        if (!!gameData && !pageSlug) {
            pageData = await fetchGameHomepage();
            isHomePage = true;
        }

        if (!gameData && !pageData) {
            pageData = await fetchMainHomepage();
            isHomePage = true;
        }

        // If we have a pageSlug and found a page but no game context,
        // it's a game page being accessed at the wrong URL → 404
        if (!gameData && pageData && !isHomePage) {
            throw redirect("/404");
        }
    }

    if (pageSlug && isHomePage) {
        throw redirect("/");
    }
    if (!pageData) {
        throw redirect("/");
    }

    const sectionsMap = await fetchNavbar();
    const origin = new URL(request.url).origin;

    return {
        gameData,
        pageData,
        gameSlug,
        pageSlug,
        sectionsMap,
        origin,
        isLDG,
    };
}
