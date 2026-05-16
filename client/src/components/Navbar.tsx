'use client'

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState('/student/dashboard');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check auth status whenever the path changes
    const token = localStorage.getItem('token');
    
    if (token) {
      setIsAuthenticated(true);
      try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        if (decodedPayload.role === 'admin') {
          setDashboardUrl('/admin/dashboard');
        } else {
          setDashboardUrl('/student/dashboard');
        }
      } catch (e) {
        console.error("Invalid token format");
      }
    } else {
      setIsAuthenticated(false);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    router.push('/login');
  };

  // Prevent hydration mismatch by not rendering auth buttons until mounted
  if (!mounted) {
    return (
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
            <span className="text-xl font-bold tracking-tight">Proctor</span>
          </Link>
          <nav className="flex items-center gap-6"></nav>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
          <span className="text-xl font-bold tracking-tight">Proctor</span>
        </Link>
        <nav className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link href={dashboardUrl} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-all border border-white/10"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 transition-all">
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
