export { default as loader } from "../../src/loaders/gameAndPageLoader";
export { default } from "../../src/components/Main";

const SITE_NAME = "Lucky Defense Guides";
const SITE_DESCRIPTION =
    "Your ultimate resource for mastering normal, hard, and hell mode. Find everything you need to progress quickly—from in-depth gameplay mechanics and strategy guides to tools like Board Builders, Upgrade Calculators, and Gacha Simulators to help you choose between 1x and 10x pulls. Whether you're just starting out or pushing endgame content, we've got you covered.";
const OG_IMAGE = "/LDG_Logo.png";

export function meta({ data, location }) {
    const gameName = data?.gameData?.title;
    const siteName = gameName ? `${gameName} Guides` : SITE_NAME;
    const pageTitle = data?.pageData?.page?.title;
    const isHomepage = !pageTitle || pageTitle === "LD Homepage";
    const title = isHomepage ? siteName : `${pageTitle} | ${siteName}`;
    const description = data?.pageData?.page?.description || (isHomepage ? SITE_DESCRIPTION : "");
    const base = import.meta.env.VITE_PUBLIC_URL || data?.origin || "";
    const ogImage = `${base}${OG_IMAGE}`;
    const ogUrl = `${base}${location.pathname}`;

    return [
        { title },
        { name: "description", content: description },
        { property: "og:site_name", content: siteName },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:image", content: ogImage },
        { property: "og:url", content: ogUrl },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
    ];
}

export function shouldRevalidate({ currentParams, nextParams }) {
    return (
        currentParams.gameSlug !== nextParams.gameSlug ||
        currentParams.pageSlug !== nextParams.pageSlug
    );
}
