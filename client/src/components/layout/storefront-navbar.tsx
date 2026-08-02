import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { Search, ShoppingCart } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

interface NavbarProps {
    cartItemCount?: number;
}
export function Navbar({ cartItemCount = 0 }: NavbarProps) {
    return (
        <header className="sticky top-0 z-50 h-14 w-full border-b border-border bg-background/95 backdrop-blur-md">
            <nav
                className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8"
                aria-label="Main Navigation"
            >
                {/* Left: Logo */}
                <div className="flex items-center">
                    <Logo showTagline />
                </div>

                {/* Right: Cart, ThemeToggle, UserMenu */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Search Icon */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="min-h-[44px] min-w-[44px]"
                        aria-label="Search Products"
                        onClick={() => {
                            // Placeholder for now
                        }}
                    >
                        <Search className="h-5 w-5" />
                    </Button>

                    {/* Cart with Item Count */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative min-h-[44px] min-w-[44px]"
                        aria-label={`Shopping Cart with ${cartItemCount} items`}
                        render={
                            <Link to="/cart">
                                <ShoppingCart className="h-5 w-5" />
                                {cartItemCount > 0 && (
                                    <Badge
                                        variant="default"
                                        className="absolute -top-1 -right-1 flex h-4 w-4 min-w-[16px] items-center justify-center rounded-full bg-primary p-0 font-body text-[10px] font-bold text-primary-foreground"
                                    >
                                        {cartItemCount > 99 ? "99+" : cartItemCount}
                                    </Badge>
                                )}
                            </Link>
                        }
                    />

                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* User Menu */}
                    <UserMenu />
                </div>
            </nav>
        </header>
    )
}