import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Outlet } from "react-router";

export default function AdminLayout() {
    return (
        <div>
            <AdminSidebar onNavClick={() => { }} />
            <main>
                <Outlet />
            </main>
        </div>
    )
}
