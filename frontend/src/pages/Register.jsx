import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        username: '',
        password: '',
        phoneNumber: ''
    });
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/login');
        } catch (err) {
            // console.log(typeof (err.response.status))
            if (err.response.status === 409) {
                setError('User already exists, Login')
            }
            else if (err.response.status === 400) {
                setError('Provide all necessary fields')
            }
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-card border border-slate-100">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        Create an account
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Enter your details to get started
                    </p>
                </div>
                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg text-center">{error}</div>}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input
                                name="fullName"
                                type="text"
                                required
                                className="block w-full rounded-xl border-slate-200 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm px-4 shadow-sm"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="block w-full rounded-xl border-slate-200 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm px-4 shadow-sm"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                            <input
                                name="username"
                                type="text"
                                required
                                className="block w-full rounded-xl border-slate-200 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm px-4 shadow-sm"
                                placeholder="johndoe"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="block w-full rounded-xl border-slate-200 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm px-4 shadow-sm"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                            <input
                                name="phoneNumber"
                                type="text"
                                required
                                className="block w-full rounded-xl border-slate-200 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm px-4 shadow-sm"
                                placeholder="00000-00000"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-xl bg-blue-500 px-3 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 hover:from-brand-500 hover:to-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-all duration-200"
                        >
                            Register
                        </button>
                    </div>
                    <div className="text-center text-sm">
                        <span className="text-slate-500">Already have an account? </span>
                        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500 hover:underline">
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
