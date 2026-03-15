import ImmortalGuardians from "../../src/components/mini-apps/ImmortalGuardians";

export const handle = { title: "Immortal Guardians" };

export default function ImmortalGuardiansPage() {
    return (
        <div style={{ viewTransitionName: "page-content" }}>
            <ImmortalGuardians />
        </div>
    );
}
