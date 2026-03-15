import Checklist from "../../src/components/Checklist";

export const handle = { title: "Flea Guide" };

import Comments from "../../src/components/comments/Comments";

export default function FleaGuide() {
    return (
        <div style={{ viewTransitionName: "page-content" }}>
            <Checklist checklistId={1} />
            <Comments pageId="flea-guide" />
        </div>
    );
}
