import ImmortalGuardians from "../../src/components/mini-apps/ImmortalGuardians";
import Comments from "../../src/components/comments/Comments";

export const handle = { title: "Immortal Guardians" };

export default function ImmortalGuardiansPage() {
    return (
        <div style={{ viewTransitionName: "page-content" }}>
            <ImmortalGuardians />
            <Comments pageId="immortal-guardians" />
        </div>
    );
}
