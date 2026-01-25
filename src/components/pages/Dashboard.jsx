import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import ProtectedRoute from "../ProtectedRoute";
import ReviewPanel from "../dashboard/ReviewPanel";
import UserManagement from "../dashboard/UserManagement";
import { usePage } from "../../hooks/usePage";

export default function DashboardContent() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("reviews");
    const { setTitle } = usePage();

    useEffect(() => {
        setTitle("Dashboard");
    }, [setTitle]);

    return (
        <div className="w-full max-w-6xl mx-auto mt-8 px-4">
            <div className="flex gap-2 mb-6 border-b border-(--primary)">
                <button
                    onClick={() => setActiveTab("reviews")}
                    className={`px-4 py-3 font-semibold cursor-pointer transition-colors ${
                        activeTab === "reviews"
                            ? "border-b-2 border-(--primary) text-(--primary) bg-(--surface-background)/30"
                            : "text-(--text-color) hover:text-(--primary)"
                    }`}
                >
                    Pending Reviews
                </button>

                {user?.role === "ADMIN" && (
                    <button
                        onClick={() => setActiveTab("users")}
                        className={`px-4 py-3 font-semibold cursor-pointer transition-colors ${
                            activeTab === "users"
                                ? "border-b-2 border-(--primary) text-(--primary) bg-(--surface-background)/30"
                                : "text-(--text-color) hover:text-(--primary)"
                        }`}
                    >
                        User Management
                    </button>
                )}
            </div>

            <div className="py-6">
                {activeTab === "reviews" && <ReviewPanel />}
                {activeTab === "users" && user?.role === "ADMIN" && (
                    <UserManagement />
                )}
            </div>
        </div>
    );
}
