import Checklist from "../../src/components/Checklist";

export const handle = { title: "Flea Guide" };

export default function FleaGuide() {
    return (
        <div style={{ viewTransitionName: "page-content" }}>
            <Checklist checklistId={1} />
        </div>
    );
}
