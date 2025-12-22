import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-card border border-slate-100">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Please enter your details to sign in
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg text-center">{error}</div>}
                    <div className="space-y-4 rounded-md">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                            <input
                                type="email"
                                required
                                className="block w-full rounded-xl border-slate-200 py-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm px-4 shadow-sm"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                className="block w-full rounded-xl border-slate-200 py-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm px-4 shadow-sm"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-xl bg-blue-500 px-3 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 hover:from-brand-500 hover:to-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-all duration-200"
                        >
                            Sign in
                        </button>
                    </div>
                    <div className="text-center text-sm">
                        <span className="text-slate-500">Don't have an account? </span>
                        <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-500 hover:underline">
                            Create account
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
