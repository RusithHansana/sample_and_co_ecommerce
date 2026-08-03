import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useState } from "react";
import { Outlet } from "react-router";

export default function AdminLayout() {
    const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const isTablet = useMediaQuery('(min-width:768px) and (max-width:1023px)');

    return (
        <div className="flex h-[100dvh] w-full overflow-hidden bg-background text-foreground">
            {/* On Desktop */}
            {isDesktop && <AdminSidebar isCollapsed={false} />}

            {/* On Tablet */}
            {isTablet && <AdminSidebar isCollapsed={true} />}

            {/* On Mobile */}
            {!isDesktop && !isTablet && (
                <Sheet
                    open={isMobileOpen}
                    onOpenChange={setIsMobileOpen}
                >
                    <SheetContent side="left" className="p-0 !w-64">
                        <AdminSidebar
                            onNavClick={() => setIsMobileOpen(false)}
                            isCollapsed={false}
                        />
                    </SheetContent>
                </Sheet>
            )}

            <div className="flex flex-1 flex-col overflow-hidden">
                <AdminTopbar onMenuToggle={() => setIsMobileOpen(true)} isMobileMenuExpanded={isMobileOpen} />
                <main
                    id="main-content"
                    className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
                >
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
