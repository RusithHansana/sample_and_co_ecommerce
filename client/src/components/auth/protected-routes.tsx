import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/hooks/use-auth";

export function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) return null;

    if (!isAuthenticated) {
        return (
            <Navigate
                to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`}
                replace
            />
        );
    }

    return <Outlet />;
}