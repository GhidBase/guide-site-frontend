import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import { useEffect } from "react";

export default function ProtectedRoute({ children, requiredRole = "USER" }) {
    const { isAuthenticated, user, isLoading } = useAuth();
    const navigate = useNavigate();

    const roles = { USER: 0, EDITOR: 1, ADMIN: 2 };

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                navigate("/login");
                return;
            }

            if (roles[user?.role] < roles[requiredRole]) {
                navigate("/access-denied");
                return;
            }
        }
    }, [isAuthenticated, user, isLoading, navigate, requiredRole]);

    if (isLoading) {
        return (
            <div className="w-full flex items-center justify-center mt-20">
                <p className="text-(--text-color)">Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return children;
}
