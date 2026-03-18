import ProtectedRoute from "../../src/components/ProtectedRoute";
import CommentOverview from "../../src/components/CommentOverview";

export const handle = { title: "Comment Overview" };

export default function CommentOverviewRoute() {
    return (
        <ProtectedRoute requiredRole="ADMIN">
            <CommentOverview />
        </ProtectedRoute>
    );
}
