import { currentAPI } from "../config/api.js";
const isLDG = import.meta.env.VITE_LDG;

export default async function gameAndPageLoader({ params, request }) {
    const { gameSlug, pageSlug } = params;

    async function fetchPageBySlug() {
        // I need to change the path based on if
        // there's a gameSlug or not
        let path = currentAPI;
        console.log(!!gameData, !!pageSlug);
        console.log(!gameSlug, !!pageSlug);
        // localhost
        if (!gameData && !!pageSlug) {
            path = path + "/" + pageSlug;
        } else if (!!gameData && !!pageSlug) {
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

    // End of the function declarations

    let gameData;
    let pageData;
    console.log("isLDG:");
    console.log(isLDG);
    if (isLDG) {
        gameData = await fetchGameBySlug("lucky-defense");
        console.log(gameData);

        if (!!pageSlug) {
            pageData = await fetchPageBySlug();
        }

        // if !!gameData && !pageSlug
        // fetchGameHomepage
        if (!!gameData && !pageSlug) {
            console.log("fetching LDG homepage");
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
        }

        console.log(!!gameData);
        console.log(!!pageData);
        if (!gameData && !pageData) {
            pageData = await fetchMainHomepage();
        }
    }

    return { gameData, pageData };
}
