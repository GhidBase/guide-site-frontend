import Leaderboard from "../../src/components/Leaderboard";
import { currentAPI } from "../../src/config/api";

export async function loader({ params, request }) {
    const { gameSlug } = params;
    const isLDG = new URL(request.url).hostname.includes("luckydefenseguides");
    const effectiveSlug = gameSlug ?? (isLDG ? "lucky-defense" : null);

    const globalPromise = fetch(currentAPI + "/leaderboard").then((r) => r.json());

    const gamePromise = effectiveSlug
        ? fetch(currentAPI + "/games/by-slug/" + effectiveSlug)
              .then((r) => r.json())
              .then((game) =>
                  fetch(currentAPI + "/games/by-id/" + game.id + "/leaderboard").then((r) => r.json()),
              )
        : Promise.resolve(null);

    const [global, game] = await Promise.all([globalPromise, gamePromise]);
    return { leaderboardGlobal: global, leaderboardGame: game };
}

export default function LeaderboardPage() {
    return (
        <div style={{ viewTransitionName: "page-content" }}>
            <Leaderboard />
        </div>
    );
}
