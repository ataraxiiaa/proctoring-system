'use client'
import Link from 'next/link';

interface ExamCardProps {
  id: string;
  title: string;
  duration: string;
  status: 'upcoming' | 'active' | 'completed';
  role: 'student' | 'admin' | 'superadmin';
}

export default function ExamCard({ id, title, duration, status, role }: ExamCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-indigo-500/30 transition-all group shadow-lg flex flex-col justify-between">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{title}</h3>
          <p className="mt-2 text-sm text-zinc-400 flex items-center gap-2 font-medium">
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {duration}
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${status === 'active' ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/30' :
          status === 'upcoming' ? 'bg-blue-500/10 text-blue-400 ring-blue-500/30' :
            'bg-zinc-500/10 text-zinc-400 ring-zinc-500/30'
          }`}>
          {status === 'active' && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      <div>
        {role === 'student' && status === 'active' && (
          <Link href={`/student/exam/${id}`} className="block w-full text-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:bg-indigo-500 transition-all transform hover:-translate-y-0.5 border border-indigo-500">
            Enter Secure Exam Room
          </Link>
        )}

        {role === 'student' && status === 'upcoming' && (
          <button disabled className="w-full rounded-xl bg-black/40 px-4 py-3 text-sm font-semibold text-zinc-500 cursor-not-allowed border border-white/5">
            Not Yet Available
          </button>
        )}

        {(role === 'admin' || role === 'superadmin') && (
          <button className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-all border border-white/10">
            View Exam Details
          </button>
        )}
      </div>
    </div>
  );
}
