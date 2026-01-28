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

    console.log();

    if (pageSlug != null && pageSlug != undefined) {
        pageData = await fetchPageBySlug();
    }

    return { gameData, pageData };
}
