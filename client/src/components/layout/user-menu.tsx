import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Package, Shield } from "lucide-react";
import { getInitials } from "@/lib/utils";

export function UserMenu() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    if (!isAuthenticated || !user) {
        return (
            <Link
                className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3 font-body text-sm font-medium rounded-md hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                to="/login"
            >
                Sign In
            </Link>
        )
    }

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="min-h-[44px] min-w-[44px] rounded-full focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="User Account Name"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-heading text-xs font-semibold">
                            {getInitials(user.name) ?? "U"}
                        </div>
                    </Button>
                }
            />
            <DropdownMenuGroup>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="font-body text-sm font-medium leading-none">{user.name}</p>
                            <p className="font-body text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        render={
                            <Link to="/orders" className="cursor-pointer">
                                <Package className="mr-2 h-4 w-4" />
                                <span>Orders</span>
                            </Link>
                        }
                    />

                    {user.role === "ADMIN" && (
                        <DropdownMenuItem
                            render={
                                <Link to="/admin" className="cursor-pointer text-primary font-medium">
                                    <Shield className="mr-2 h-4 w-4" />
                                    <span>Admin Dashboard</span>
                                </Link>
                            }
                        />
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:text-destructive"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenuGroup>
        </DropdownMenu>
    )
}