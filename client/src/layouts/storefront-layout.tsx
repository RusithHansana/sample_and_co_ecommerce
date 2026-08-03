import { Navbar } from "@/components/layout/storefront-navbar";
import { Outlet, useLocation } from "react-router";

export default function StorefrontLayout() {
    const location = useLocation();
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">

            {/* Sticky Header Nav */}
            <Navbar cartItemCount={0} />

            {/* Main Content Area */}
            <main
                id="main-content"
                className="flex-1 w-full min-h-[calc(100vh-3.5rem)] max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6"
            >
                <div
                    key={location.key}
                    className="animate-content-fade-in h-full"
                >
                    <Outlet />
                </div>
            </main>

            <footer className="border-t border-border py-6 text-center font-bodt text-xs text-muted-foreground"
            >
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <p>&copy; {new Date().getFullYear()} Sample &amp; Co. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
