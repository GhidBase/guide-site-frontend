import { currentAPI } from "../config/api.js";

export default async function gameAndPageLoader({ params, request }) {
    const { gameSlug, pageSlug } = params;

    async function fetchPageBySlug() {
        // I need to change the path based on if
        // there's a gameSlug or not
        let path = currentAPI;
        // localhost
        if (!gameSlug && !!pageSlug) {
            path = path + "/" + pageSlug;
        } else if (!!gameSlug && !!pageSlug) {
            path =
                path + "/games/" + gameData.id + "/pages/by-slug/" + pageSlug;
        }
        const response = await fetch(path);
        const result = await response.json();
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

    async function fetchGameBySlug() {
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

    let gameData;
    let pageData;
    if (gameSlug != null && gameSlug != undefined) {
        gameData = await fetchGameBySlug();
    }

    if (!!pageSlug) {
        pageData = await fetchPageBySlug();
    }
    // if !!gameData && !pageSlug
    // fetchGameHomepage
    if (!!gameData && !pageSlug) {
        pageData = await fetchGameHomepage();
    }

    console.log(!!gameData);
    console.log(!!pageData);
    if (!gameData && !pageData) {
        pageData = await fetchMainHomepage();
    }

    return { gameData, pageData };
}
