import { Navbar } from "@/components/layout/storefront-navbar";
import { Outlet } from "react-router";

export default function StorefrontLayout() {
    return (
        <div>
            <Navbar />
            <main>
                <Outlet />
            </main>
            <footer>Footer Placeholder</footer>
        </div>
    )
}
