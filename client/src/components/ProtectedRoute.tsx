'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Role = 'student' | 'admin' | 'superadmin';

export default function ProtectedRoute({
  children,
  requiredRole
}: {
  children: React.ReactNode,
  requiredRole?: Role | Role[]
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const userRole: Role = decodedPayload.role;

      if (requiredRole) {
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        
        // Superadmin has full system access and is allowed on admin routes
        if (allowedRoles.includes('admin') && !allowedRoles.includes('superadmin')) {
          allowedRoles.push('superadmin');
        }

        if (!allowedRoles.includes(userRole)) {
          router.push('/login');
          return;
        }
      }
      setIsAuthorized(true);
    } catch (e) {
      router.push('/login');
    }
  }, [router, requiredRole]);

  if (!isAuthorized) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
