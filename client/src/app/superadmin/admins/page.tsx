'use client'
import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import api from '@/app/lib/api';

interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

export default function SuperadminPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/admin/list-admins');
      setAdmins(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsCreating(true);
    try {
      await api.post('/admin/create-admin', { email, full_name: fullName, password });
      setEmail('');
      setFullName('');
      setPassword('');
      fetchAdmins();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create admin');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    if (!confirm('Are you sure you want to permanently remove this admin?')) return;
    try {
      await api.delete(`/admin/remove-admin/${id}`);
      fetchAdmins();
    } catch (err) {
      console.error("Failed to delete admin", err);
    }
  };

  return (
    <ProtectedRoute requiredRole="superadmin">
      <div className="flex min-h-[calc(100vh-4rem)] bg-zinc-950">
        <Sidebar role="superadmin" />
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Superadmin Control Panel</h1>
              <p className="text-zinc-400">Manage system administrators and elevated access.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Form Section */}
              <div className="lg:col-span-1">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sticky top-8">
                  <h2 className="text-xl font-semibold text-white mb-6">Create New Admin</h2>

                  {error && (
                    <div className="mb-4 rounded-lg bg-red-500/10 p-3 border border-red-500/20">
                      <p className="text-sm font-medium text-red-400">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleCreateAdmin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        placeholder="admin@school.edu"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1">Secure Password</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="w-full mt-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-500 transition-all disabled:opacity-50"
                    >
                      {isCreating ? 'Provisioning...' : 'Provision Admin Account'}
                    </button>
                  </form>
                </div>
              </div>

              {/* List Section */}
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <h2 className="text-xl font-semibold text-white mb-6">Active Administrators</h2>

                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                    </div>
                  ) : admins.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">
                      No administrators found. Create one to get started.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {admins.map((admin) => (
                        <div key={admin.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/30 hover:bg-black/50 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                              {admin.full_name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{admin.full_name}</p>
                              <p className="text-xs text-zinc-500">{admin.email}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteAdmin(admin.id)}
                            className="p-2 rounded-lg text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                            title="Revoke Admin Access"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
