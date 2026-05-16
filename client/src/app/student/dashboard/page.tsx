'use client'
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import ExamCard from '@/components/ExamCard';

export default function StudentDashboard() {
  return (
    <ProtectedRoute requiredRole="student">
      <div className="flex min-h-[calc(100vh-4rem)] bg-zinc-950">
        <Sidebar role="student" />
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Dashboard</h1>
            <p className="text-zinc-400 mb-10">View your active and upcoming examinations securely.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ExamCard
                id="ex_123"
                title="CS301: Introduction to AI - Midterm"
                duration="60 mins"
                status="active"
                role="student"
              />
              <ExamCard
                id="ex_124"
                title="CS305: Data Structures - Final"
                duration="120 mins"
                status="upcoming"
                role="student"
              />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
