import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, MenuItem } from "./ui/navbar-menu";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);
  return (
    <div className="fixed top-4 md:top-6 inset-x-0 z-50 flex justify-center px-4">
      <div
        className={cn(
          "flex items-center justify-between gap-2 md:gap-6 rounded-full border px-3 md:px-4 py-2 w-full md:w-[85vw] lg:w-[70vw]",
          "bg-white shadow-[0_6px_20px_rgba(0,0,0,0.10)]"
        )}
      >
        {/* Logo */}
        <div className="shrink-0">
          <NavLink to="/" className={"flex items-center gap-1"} onClick={closeMobile}>
            <img src="/trademilaan.png" alt="Trademilaan Logo" className="h-6 w-6 md:h-8 md:w-8" />
            <p className="text-sm md:text-lg font-semibold">Trademilaan</p>
          </NavLink>
        </div>

        {/* Desktop menu */}
        <div className="hidden lg:flex">
          <Menu>
            <MenuItem to="/">Home</MenuItem>
            <MenuItem to="/services">Services</MenuItem>
            <MenuItem to="/investor-charter">Investor Charter</MenuItem>
            <MenuItem to="/disclaimer-disclosure">Disclaimer & Disclosure</MenuItem>
            <MenuItem to="/mitc">MITC</MenuItem>
            <MenuItem to="/contact">Contact Us</MenuItem>
          </Menu>
        </div>

        {/* Mobile menu button */}
        <button
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          className="inline-flex items-center justify-center rounded-full border md:border-0 px-3 py-1.5 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className="mr-2 text-sm">Menu</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* CTA */}
        <NavLink
          to="/enquire"
          className="shrink-0 rounded-full bg-[#9BE749] px-3 md:px-6 py-1.5 md:py-2 text-sm md:text-base font-medium"
        >
          Enquire Now
        </NavLink>
      </div>

      {/* Mobile overlay menu */}
      {mobileOpen && (
        <div id="mobile-menu" className="lg:hidden">
          <div className="fixed inset-0 z-[60] bg-black/30" onClick={closeMobile} />
          <div className="fixed top-16 left-0 right-0 z-[61] px-4">
            <div className="mx-auto max-w-[90vw] rounded-2xl border bg-white shadow-xl">
              <div className="flex flex-col p-4 gap-3">
                <NavLink to="/" onClick={closeMobile} className="py-2">Home</NavLink>
                <NavLink to="/services" onClick={closeMobile} className="py-2">Services</NavLink>
                <NavLink to="/investor-charter" onClick={closeMobile} className="py-2">Investor Charter</NavLink>
                <NavLink to="/disclaimer-disclosure" onClick={closeMobile} className="py-2">Disclaimer & Disclosure</NavLink>
                <NavLink to="/mitc" onClick={closeMobile} className="py-2">MITC</NavLink>
                <NavLink to="/contact" onClick={closeMobile} className="py-2">Contact Us</NavLink>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
