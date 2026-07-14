import { Outlet } from "react-router";

export default function AdminLayout() {
    return (
        <div>
            <aside>Sidebar Placeholder</aside>
            <main>
                <Outlet />
            </main>
        </div>
    )
}