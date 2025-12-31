"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import Footer from "./Footer";

const HIDE_NAV_PATHS = ["/login", "/register"];

export default function AppFrame({ children }) {
  const pathname = usePathname();
  const hideNav = HIDE_NAV_PATHS.includes(pathname);

  return (
    <>
      {!hideNav && <Navbar />}
      {children}
      <Footer />
    </>
  );
}
