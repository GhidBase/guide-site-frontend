import ProtectedRoute from "../../src/components/ProtectedRoute";
import NavigationPanel from "../../src/components/NavigationPanel";

export const handle = { title: "Navbar Manager" };

export default function NavigationPanelRoute() {
    return (
        <div style={{ viewTransitionName: "page-content" }}>
            <ProtectedRoute requiredRole="ADMIN">
                <NavigationPanel isAdmin={true} />
            </ProtectedRoute>
        </div>
    );
}
