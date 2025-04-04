"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  Home,
  Search,
  User,
  Settings,
  HelpCircle,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logOut } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { name: "Home", href: "/", icon: <Home className="h-4 w-4 mr-2" /> },
    {
      name: "Features",
      href: "/features",
      icon: <Search className="h-4 w-4 mr-2" />,
    },
    {
      name: "Pricing",
      href: "/pricing",
      icon: <Settings className="h-4 w-4 mr-2" />,
    },
    { name: "About", href: "/about", icon: <User className="h-4 w-4 mr-2" /> },
    {
      name: "Contact",
      href: "/contact",
      icon: <HelpCircle className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-custom flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 rounded-full bg-primary/20"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-primary"
                  fill="currentColor"
                >
                  <path d="M12 1L15.5 8.5L23 9.5L17.5 15L19 23L12 19L5 23L6.5 15L1 9.5L8.5 8.5L12 1Z" />
                </svg>
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight">Stellar AI</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href ? "text-primary" : "text-foreground/70"
              }`}
            >
              {item.name}
            </Link>
          ))}

          {user ? (
            <>
              <Link
                href="/chat/new"
                className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith("/chat")
                    ? "text-primary"
                    : "text-foreground/70"
                }`}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Link>

              <div className="flex items-center gap-2 ml-2">
                <Link
                  href="/profile"
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  {user.displayName || "Profile"}
                </Link>
                <button
                  onClick={() => logOut()}
                  className="btn btn-ghost"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link href="/login" className="btn btn-secondary">
                Sign In
              </Link>
              <Link href="/signup" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden rounded-md p-2 text-foreground/70 hover:bg-accent hover:text-accent-foreground"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-b border-border/40">
          <nav className="container-custom py-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href ? "text-primary" : "text-foreground/70"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  href="/chat/new"
                  className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                    pathname.startsWith("/chat")
                      ? "text-primary"
                      : "text-foreground/70"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Link>

                <Link
                  href="/profile"
                  className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                    pathname === "/profile"
                      ? "text-primary"
                      : "text-foreground/70"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>

                <button
                  onClick={() => {
                    logOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center text-sm font-medium transition-colors hover:text-primary text-foreground/70"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="btn btn-secondary w-full justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="btn btn-primary w-full justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
