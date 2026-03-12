import "dotenv/config";

const API = process.env.VITE_SERVER;

export default {
    appDirectory: "app",
    ssr: true,
    async prerender() {
        const staticRoutes = [
            "/",
            "/guardian-upgrade-costs",
            "/immortal-guardians",
        ];

        try {
            const gameRes = await fetch(API + "/games/by-slug/lucky-defense");
            const game = await gameRes.json();
            const pagesRes = await fetch(
                API + "/games/" + game.id + "/pages",
            );
            const pages = await pagesRes.json();
            const slugs = Array.isArray(pages)
                ? pages.filter((p) => p.slug).map((p) => "/" + p.slug)
                : [];
            return [...staticRoutes, ...slugs];
        } catch (e) {
            console.warn(
                "[prerender] Could not fetch pages from API, using static routes only:",
                e.message,
            );
            return staticRoutes;
        }
    },
};
