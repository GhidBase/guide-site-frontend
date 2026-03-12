export { default as loader } from "../../src/loaders/gameAndPageLoader";
export { default } from "../../src/components/Main";

const SITE_NAME = "Lucky Defense Guides";
const SITE_DESCRIPTION =
    "Your ultimate resource for mastering normal, hard, and hell mode. Find everything you need to progress quickly—from in-depth gameplay mechanics and strategy guides to tools like Board Builders, Upgrade Calculators, and Gacha Simulators to help you choose between 1x and 10x pulls. Whether you're just starting out or pushing endgame content, we've got you covered.";
const OG_IMAGE = "/LDG_Logo.png";

export function meta({ data, matches }) {
    const pageTitle = data?.pageData?.page?.title;
    const isHomepage = !pageTitle || pageTitle === "LD Homepage";
    const title = isHomepage ? SITE_NAME : `${pageTitle} | ${SITE_NAME}`;

    return [
        { title },
        { name: "description", content: SITE_DESCRIPTION },
        { property: "og:site_name", content: SITE_NAME },
        { property: "og:title", content: title },
        { property: "og:description", content: SITE_DESCRIPTION },
        { property: "og:type", content: "website" },
        { property: "og:image", content: OG_IMAGE },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: SITE_DESCRIPTION },
    ];
}

export function shouldRevalidate({ currentParams, nextParams }) {
    return (
        currentParams.gameSlug !== nextParams.gameSlug ||
        currentParams.pageSlug !== nextParams.pageSlug
    );
}
