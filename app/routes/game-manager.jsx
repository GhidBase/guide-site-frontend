import ProtectedRoute from "../../src/components/ProtectedRoute";
import GameManager from "../../src/components/GameManager";

export const handle = { title: "Game Manager" };

export default function GameManagerRoute() {
    return (
        <ProtectedRoute requiredRole="ADMIN">
            <GameManager isAdmin={true} />
        </ProtectedRoute>
    );
}
