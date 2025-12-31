import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/Navbar";
import Footer from "./components/Footer";

import { CursorTrailer } from "./components/CursorTrailer";

import { AuthProvider} from "./context/AuthContext";
import AppFrame from "./components/AppFrame";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Trademilaan - AI-Powered Market Insights",
  description: "Empowering traders with AI-driven market insights. SEBI-registered research analyst providing expert trading strategies for equity, options, and commodities.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}

      >
        <CursorTrailer />
      
       <AuthProvider>
        <AppFrame>
          {children}
        </AppFrame>
      </AuthProvider>
        
      </body>
    </html>
  );
}
