import GuardianCosts from "../../src/components/mini-apps/GuardianCosts";

export const handle = { title: "Upgrade Costs" };

export default function GuardianCostsPage() {
    return (
        <div style={{ viewTransitionName: "page-content" }}>
            <GuardianCosts />
        </div>
    );
}
