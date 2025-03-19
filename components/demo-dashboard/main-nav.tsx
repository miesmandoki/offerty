import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname() || "";

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/app"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/app" ? "text-primary" : "text-muted-foreground"
        )}
      >
        Dashboard
      </Link>
      <Link
        href="/proposals"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          (pathname === "/proposals" || pathname.startsWith("/proposals/")) &&
            pathname !== "/proposals/new"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Offerter
      </Link>
      <Link
        href="/proposals/new"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/proposals/new"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Ny offert
      </Link>
      <Link
        href="#"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Kunder
      </Link>
      <Link
        href="#"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Inställningar
      </Link>
    </nav>
  );
}
