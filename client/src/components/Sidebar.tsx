'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  role: 'student' | 'admin' | 'superadmin';
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  let links: { name: string, href: string }[] = [];

  if (role === 'superadmin') {
    links = [
      { name: 'Manage Admins', href: '/superadmin/admins' }
    ];
  } else if (role === 'admin') {
    links = [
      { name: 'Dashboard', href: '/admin/dashboard' },
      { name: 'Create Exam', href: '/admin/exams/create' },
    ];
  } else {
    links = [
      { name: 'Dashboard', href: '/student/dashboard' },
    ];
  }

  return (
    <div className="w-64 min-h-[calc(100vh-4rem)] bg-black/30 border-r border-white/5 p-6 flex flex-col gap-2">
      <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 ml-2">
        {role === 'superadmin' ? 'Superadmin Panel' : role === 'admin' ? 'Administration' : 'Student Portal'}
      </div>
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-3 rounded-xl transition-all ${isActive
              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
          >
            {link.name}
          </Link>
        )
      })}
    </div>
  );
}
