import { Outlet } from "react-router";

export default function AdminLayout() {
    return (
        <>
            <aside>Sidebar Placeholder</aside>
            <main>
                <Outlet />
            </main>
        </>
    )
}