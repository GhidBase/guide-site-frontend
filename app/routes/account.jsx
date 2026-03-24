import ProtectedRoute from "../../src/components/ProtectedRoute";
import AccountPage from "../../src/components/AccountPage";

export const handle = { title: "Account" };

export default function AccountRoute() {
    return (
        <div style={{ viewTransitionName: "page-content" }}>
            <ProtectedRoute>
                <AccountPage />
            </ProtectedRoute>
        </div>
    );
}
