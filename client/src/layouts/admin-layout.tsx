import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";
import { Outlet } from "react-router";

export default function AdminLayout() {
    return (
        <div>
            <AdminSidebar onNavClick={() => { }} />
            <main>
                <AdminTopbar />
                <Outlet />
            </main>
        </div>
    )
}
