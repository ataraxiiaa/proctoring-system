'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const formData = new URLSearchParams()
            formData.append('username', email)
            formData.append('password', password)

            const response = await api.post('/auth/login', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })

            const token = response.data.access_token
            localStorage.setItem('token', token)

            const payloadBase64 = token.split('.')[1]
            const decodedPayload = JSON.parse(atob(payloadBase64))

            if (decodedPayload.role === 'admin') {
                router.push('/admin/dashboard')
            } else if (decodedPayload.role === 'superadmin') {
                router.push('/superadmin/admins')
            } else {
                router.push('/student/dashboard')
            }
        } catch (error: any) {
            setError(error.response?.data?.detail || 'Login failed. Please check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
            {/* Background Glow */}
            <div className="absolute inset-0 -z-10 overflow-hidden blur-3xl">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#4f46e5] to-[#9089fc] opacity-10 sm:w-[72.1875rem]" />
            </div>

            <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-center text-sm text-zinc-400">
                        Sign in to monitor your sessions
                    </p>
                </div>

                {error && (
                    <div className="rounded-md bg-red-500/10 p-4 border border-red-500/20">
                        <p className="text-center text-sm font-medium text-red-400">{error}</p>
                    </div>
                )}

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email address</label>
                            <input
                                type="email"
                                required
                                className="block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
                            <input
                                type="password"
                                required
                                className="block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Logging in...' : 'Log in'}
                    </button>
                </form>

                <p className="text-center text-sm text-zinc-500 pt-4">
                    Don't have an account?{' '}
                    <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}