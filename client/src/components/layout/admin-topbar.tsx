import { Link, useLocation } from "react-router";
import { Menu } from "lucide-react";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AdminTopbarProps {
    onMenuToggle: () => void;
}

export function AdminTopbar({ onMenuToggle }: AdminTopbarProps) {
    const location = useLocation();

    const getBreadCrumbs = () => {
        const paths = location.pathname.split("/").filter(Boolean);

        return paths
            .map((path, i) => {
                const url = `/${paths.slice(0, i + 1).join("/")}`;
                const isLast = i === paths.length - 1;
                const title = path.charAt(0).toUpperCase() + path.slice(1);

                return {
                    title,
                    url,
                    isLast
                }
            })
    };

    const breadcrumbs = getBreadCrumbs();

    return (
        <header className="sticky top-0 z-40 h-14 w-full border-b border-border bg-background/95 backdrop-blur-md px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                {/* Mobile Hamburger */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden min-h-[44px] min-w-[44px]"
                    onClick={onMenuToggle}
                    aria-label="Toggle Admin Sidebar Navigation"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Breadcrumbs */}
                <nav
                    className="hidden sm:flex items-center space-x-2 font-body text-xs"
                    aria-label="Breadcrumbs"
                >
                    {breadcrumbs.map((crumb, i) => (
                        <div
                            key={crumb.url}
                            className="flex items-center"
                        >
                            {i > 0 && <span className="mx-2 text-muted-foreground">/</span>}
                            {crumb.isLast ? (
                                <span className="font-semibold text-foreground">{crumb.title}</span>
                            ) : (
                                <Link
                                    to={crumb.url}
                                    className="text-muted-foreground hover:text-forground"
                                >
                                    {crumb.title}
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            {/* Theme Toggle and User Menu */}
            <div className="flex items-center gap-2">
                <ThemeToggle />
                <UserMenu />
            </div>
        </header>
    )
}