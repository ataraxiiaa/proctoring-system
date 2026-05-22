'use client'

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import ExamCard from '@/components/ExamCard';
import api from '@/app/lib/api';

interface Exam {
  id: number | string;
  title: string;
  duration_minutes: number;
  status: string;
}

export default function StudentDashboard() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await api.get('/exams');
        setExams(response.data);
      } catch (err: any) {
        console.error('Error fetching exams:', err);
        setError('Failed to load active examinations. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  return (
    <ProtectedRoute requiredRole="student">
      <div className="flex min-h-[calc(100vh-4rem)] bg-zinc-950">
        <Sidebar role="student" />
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Dashboard</h1>
            <p className="text-zinc-400 mb-10">View your active and upcoming examinations securely.</p>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="rounded-2xl border border-white/5 bg-white/5 p-6 animate-pulse space-y-6">
                    <div className="h-6 bg-white/10 rounded-md w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded-md w-1/2"></div>
                    <div className="h-10 bg-white/10 rounded-xl w-full mt-4"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center max-w-md mx-auto">
                <p className="text-red-400 text-sm font-semibold">{error}</p>
              </div>
            ) : exams.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-white/5 p-12 text-center max-w-md mx-auto">
                <svg className="w-12 h-12 text-zinc-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-white font-bold mb-1">No Exams Assigned</h3>
                <p className="text-zinc-500 text-sm">There are no examinations active or scheduled for you at this time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map((exam) => {
                  const statusVal = exam.status === 'active' || exam.status === 'upcoming' || exam.status === 'completed'
                    ? exam.status
                    : 'active';
                  return (
                    <ExamCard
                      key={exam.id}
                      id={String(exam.id)}
                      title={exam.title}
                      duration={`${exam.duration_minutes} mins`}
                      status={statusVal}
                      role="student"
                    />
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
