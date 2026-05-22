'use client'

import api from '@/app/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { useEffect, useState } from 'react';


export default function AdminDashboard() {
  const [totalExams, settotalExams] = useState('0')
  const [violations, setViolations] = useState('0')
  const [enrolledStudents, setenrolledStudents] = useState('0')

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard-stats')
      if (res.status === 200) {
        settotalExams(res.data.total_exams?.toString() || '0')
        setViolations(res.data.violations?.toString() || '0')
        setenrolledStudents(res.data.enrolled_students?.toString() || '0')
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex min-h-[calc(100vh-4rem)] bg-zinc-950">
        <Sidebar role="admin" />
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Admin Dashboard</h1>
              <p className="text-zinc-400">Manage examinations, view security violations, and monitor active sessions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stat 1 */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <span className="text-sm font-medium text-zinc-500 block mb-2">Active Exams</span>
                <span className="text-3xl font-bold text-white">{totalExams}</span>
              </div>
              {/* Stat 2 */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <span className="text-sm font-medium text-zinc-500 block mb-2">Violations Flags</span>
                <span className="text-3xl font-bold text-red-400">{violations}</span>
              </div>
              {/* Stat 3 */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <span className="text-sm font-medium text-zinc-500 block mb-2">Enrolled Students</span>
                <span className="text-3xl font-bold text-indigo-400">{enrolledStudents}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-white mb-4">Exam Monitoring Overview</h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                All monitoring systems are active. Please use the sidebar to manage exams or view real-time incident reports.
              </p>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                All Systems Operational
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
