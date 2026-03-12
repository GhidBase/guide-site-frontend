import ProtectedRoute from "../../src/components/ProtectedRoute";
import NavigationPanel from "../../src/components/NavigationPanel";

export const handle = { title: "Navbar Manager" };

export default function NavigationPanelRoute() {
    return (
        <ProtectedRoute requiredRole="ADMIN">
            <NavigationPanel isAdmin={true} />
        </ProtectedRoute>
    );
}
