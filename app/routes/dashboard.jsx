import ProtectedRoute from "../../src/components/ProtectedRoute";
import DashboardContent from "../../src/components/pages/Dashboard";

export const handle = { title: "Dashboard" };

export default function Dashboard() {
    return (
        <ProtectedRoute requiredRole="EDITOR">
            <DashboardContent />
        </ProtectedRoute>
    );
}
