import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/hooks/use-auth";

export function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return null;

    if (isAuthenticated) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return <Outlet />;
}