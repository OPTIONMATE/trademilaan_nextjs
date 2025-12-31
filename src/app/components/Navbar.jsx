"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MenuItem } from "./ui/Navbar-menu";
import { cn } from "@/app/lib/utils";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  // Keep a single source of truth for nav links to avoid mismatches across breakpoints.
  const navLinks = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/services", label: "Services" },
      { href: "/investor-charter", label: "Investor Charter" },
      { href: "/disclaimer-disclosure", label: "Disclaimer & Disclosure" },
      { href: "/mitc", label: "MITC" },
      { href: "/contact", label: "Contact Us" },
    ],
    []
  );

  const closeMobile = () => setMobileOpen(false);

  // Close the mobile tray when users navigate to a different route.
  useEffect(() => {
    closeMobile();
  }, [pathname]);

  const profileInitial = (user?.username || user?.email || "U").slice(0, 1).toUpperCase();

  return (
    <header className="fixed top-3 sm:top-4 inset-x-0 z-50 flex justify-center px-3 sm:px-4">
      <div
        className={cn(
          "flex items-center justify-between gap-2 sm:gap-3 md:gap-6 rounded-full border px-3 sm:px-4 md:px-5 py-2 w-full max-w-screen-xl",
          "bg-white/90 backdrop-blur-sm shadow-[0_6px_18px_rgba(0,0,0,0.12)]"
        )}
      >
        {/* Logo */}
        <div className="shrink-0 min-w-0">
          <Link href="/" className="flex items-center gap-2" onClick={closeMobile}>
            <img src="/trademilaan.png" alt="Trademilaan Logo" className="h-7 w-7 sm:h-8 sm:w-8" />
            <p className="text-sm sm:text-base md:text-lg font-semibold leading-tight truncate">Trademilaan</p>
          </Link>
        </div>

        {/* Desktop menu */}
        <div className="hidden lg:flex flex-1 justify-center">
          <Menu>
            {navLinks.map((link) => (
              <MenuItem key={link.href} href={link.href}>
                {link.label}
              </MenuItem>
            ))}
          </Menu>
        </div>

        {/* Mobile menu button */}
        <button
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          className="inline-flex items-center justify-center gap-2 rounded-full border md:border-0 px-2.5 py-1.5 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg
            className="h-5 w-5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M3 6h18M3 12h18M3 18h18" stroke="#111" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="hidden sm:inline text-sm font-medium">Menu</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <Link
              href="/profile"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white text-sm font-semibold shadow hover:bg-neutral-800 transition"
              aria-label="Profile"
            >
              {profileInitial}
            </Link>
          )}

          {/* CTA */}
          <Link
            href="/contact"
            className="hidden sm:inline-flex shrink-0 rounded-full bg-[#9BE749] px-3 md:px-6 py-1.5 md:py-2 text-sm md:text-base font-medium"
          >
            Enquire Now
          </Link>
        </div>
      </div>

      {/* Mobile overlay menu */}
      {mobileOpen && (
        <div id="mobile-menu" className="lg:hidden">
          <div className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px]" onClick={closeMobile} />
          <div className="fixed top-[76px] sm:top-[86px] left-0 right-0 z-50 px-3 sm:px-4">
            <div className="mx-auto w-full max-w-screen-sm overflow-hidden rounded-2xl border bg-white shadow-xl">
              <div className="flex flex-col p-4 gap-1">
                {user && (
                  <Link
                    href="/profile"
                    onClick={closeMobile}
                    className="flex items-center justify-between rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white"
                  >
                    <span>Profile</span>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white">
                      {profileInitial}
                    </span>
                  </Link>
                )}

                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobile}
                    className="py-3 text-base font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/contact"
                  onClick={closeMobile}
                  className="mt-2 inline-flex items-center justify-center rounded-full bg-[#9BE749] px-4 py-2 text-sm font-semibold"
                >
                  Enquire Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
