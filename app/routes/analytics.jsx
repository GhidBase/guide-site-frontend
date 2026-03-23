import ProtectedRoute from "../../src/components/ProtectedRoute";
import Analytics from "../../src/components/Analytics";

export const handle = { title: "Analytics" };

export default function AnalyticsRoute() {
    return (
        <div style={{ viewTransitionName: "page-content" }}>
            <ProtectedRoute requiredRole="EDITOR">
                <Analytics />
            </ProtectedRoute>
        </div>
    );
}
