"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import Footer from "./Footer";
import PageIntroLoader from "./PageIntroLoader";
import LogoutOverlay from "./LogoutOverlay";
import { useAuth } from "../context/AuthContext";

const HIDE_NAV_PATHS = ["/login", "/register"];

export default function AppFrame({ children }) {
  const pathname = usePathname();
  const { loggingOut } = useAuth();
  const hideNav = HIDE_NAV_PATHS.includes(pathname);

  return (
    <>
      <PageIntroLoader />
      <LogoutOverlay />
      {!hideNav && !loggingOut && <Navbar />}
      {!loggingOut && children}
      {!loggingOut && <Footer />}
    </>
  );
}
