import { Link } from "react-router";
import { getBrandName, getBrandTagline } from "@/config/brand";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    showTagline?: boolean;
};

export function Logo({ className, showTagline = false }: LogoProps) {
    const brandName = getBrandName();

    return (
        <Link
            to="/"
            className={cn("inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm no-underline", className)}
            aria-label={`${brandName} | Home`}
        >
            <span className="flex items-center justify-center w-7 h-7 rounded-sm bg-primary text-primary-foreground font-heading font-bold text-base leading-none">
                &
            </span>
            <div className="flex flex-col">
                <span className="font-heading font-bold text-sm tracking-[0.06em] uppercase text-foreground">
                    {brandName}
                </span>
                {
                    showTagline && (
                        <span className="font-body text-[10px] text-muted-foreground tracking-normal">
                            {getBrandTagline()}
                        </span>
                    )
                }
            </div>
        </Link>
    )
}

