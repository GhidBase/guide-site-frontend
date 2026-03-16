import GuardianCosts from "../../src/components/mini-apps/GuardianCosts";
import Comments from "../../src/components/comments/Comments";

export const handle = { title: "Upgrade Costs" };

export default function GuardianCostsPage() {
    return (
        <div style={{ viewTransitionName: "page-content" }}>
            <GuardianCosts />
            <Comments pageId="guardian-upgrade-costs" />
        </div>
    );
}
