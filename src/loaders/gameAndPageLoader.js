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
        const response = await fetch(
            currentAPI +
                "/games/" +
                gameData.id +
                "/pages/by-slug/" +
                gameData.slug,
        );
        const result = await response.json();
        return result;
    }

    async function fetchMainHomepage() {
        const response = await fetch(currentAPI + "/pages/by-slug/homepage");
        const result = await response.json();
        return result;
    }

    async function fetchGameBySlug(gameSlug) {
        if (gameSlug == undefined) {
            return;
        }

        const response = await fetch(currentAPI + "/games/by-slug/" + gameSlug);
        if (response == null || response == undefined) {
            return;
        }
        const result = await response.json();
        return result;
    }

    async function fetchNavbar() {
        const url = gameData
            ? currentAPI + "/sections/navbar?gameId=" + gameData.id
            : currentAPI + "/sections/navbar";
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return new Map();

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

        //if (!gameData && !!pageData) {
        //pageData = await fetchPageBySlug();
        //isHomePage = true;
        //}
    }

    if (pageSlug && isHomePage) {
        throw redirect("/");
    }
    if (!pageData) {
        throw redirect("/");
    }

    const pathname = new URL(request.url).pathname;
    const isMainHomepage = pathname === "/" && !gameSlug && !pageSlug;
    const isGameHomepage = !!gameSlug && !pageSlug && pathname === `/games/${gameSlug}`;
    const isTrackable = !!pageSlug || isMainHomepage || isGameHomepage;
    if (pageData?.page?.id && isTrackable) {
        fetch(`${currentAPI}/pages/by-id/${pageData.page.id}/view`, { method: "POST" }).catch(() => {});
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
