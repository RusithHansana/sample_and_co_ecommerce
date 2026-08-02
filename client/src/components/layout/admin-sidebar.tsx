import { Link, useLocation } from "react-router";
import { ClipboardList, Home, Package } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
    onNavClick?: () => void;
    isCollapsed?: boolean;
}

const adminNavItems = [
    { label: 'Dashboard', href: '/admin', icon: Home, exact: true },
    { label: 'Products', href: '/admin/products', icon: Package, exact: false },
    { label: 'Orders', href: '/admin/orders', icon: ClipboardList, exact: false },
];


export function AdminSidebar({ onNavClick, isCollapsed = false }: AdminSidebarProps) {
    const location = useLocation();

    const isItemActive = (href: string, exact: boolean) => {
        if (exact) {
            return location.pathname === href;
        }

        return location.pathname.startsWith(href);
    }

    return (
        <aside className={cn("flex flex-col h-full bg-card border-r border-border py-4", isCollapsed ? "w-16" : "w-64")}>
            {/* Header Logo */}
            <div className={cn("px-4 pb-6 border-b border-border flex items-center", isCollapsed && "justify-center px-0")}>
                {isCollapsed ? (
                    <span className="flex items-center justify-center w-8 h-8 rounded-sm bg-primary text-primary-foreground font-heading font-bold text-lg">&</span>
                ) : (
                    <Logo showTagline />
                )}
            </div>

            {/* Nav Links */}
            <nav
                className="flex-1 px-2 py-4 space-y-1"
                aria-label="Admin Navigation"
            >
                {adminNavItems.map((item) => {
                    const isActive = isItemActive(item.href, item.exact);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            onClick={onNavClick}
                            title={isCollapsed ? item.label : undefined}
                            className={cn("flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors min-h-[44px]", isActive ? "bg-secondary text-primary font-bold border-l-4 border-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                                isCollapsed && "justify-center px-0 border-l-0"
                            )}
                        >
                            <Icon />
                            {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                    )
                })
                }
            </nav>
        </aside>
    )
}