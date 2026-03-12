import ProtectedRoute from "../../src/components/ProtectedRoute";
import PageManager from "../../src/components/PageManager";

export const handle = { title: "Page Manager" };

export default function PageManagerRoute() {
    return (
        <ProtectedRoute requiredRole="ADMIN">
            <PageManager isAdmin={true} />
        </ProtectedRoute>
    );
}
