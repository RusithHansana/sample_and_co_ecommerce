import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import ForbiddenPage from "@/pages/forbidden-page";

export default function AdminRoute() {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) return null;

    if (!isAuthenticated) {
        return (
            <Navigate
                to={'/login'}
                replace
            />
        );
    }

    if (user?.role !== "ADMIN") {
        return <ForbiddenPage />
    }

    return <Outlet />
}