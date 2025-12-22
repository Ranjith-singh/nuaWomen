import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, FileText } from 'lucide-react';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-linear-to-r from-indigo-500 to-purple-500">
            <nav className="bg-linear-to-r from-brand-900 to-brand-600 shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-90">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="shrink-0 flex items-center text-white font-bold text-2xl tracking-tight hover:opacity-90 transition-opacity">
                                <FileText className="h-7 w-7 mr-2" />
                                Secure File Share
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <>
                                    <div className="hidden md:flex items-center px-4 py-1.5 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-md">
                                        <User className="h-4 w-4 mr-2" />
                                        <span className="font-medium text-sm">{user.username}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all duration-200"
                                        title="Logout"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </>
                            ) : (
                                <div className="space-x-4 ">
                                    <Link to="/login" className="bg-accent-500 text-white px-5 py-2 rounded-full font-medium shadow-lg hover:text-purple-400 hover:shadow-accent-500/30 transition-all duration-200 transform hover:-translate-y-0.5">
                                        Login
                                    </Link>
                                    <Link to="/register" className="bg-accent-500 text-white px-5 py-2 rounded-full font-medium shadow-lg hover:text-purple-400 hover:shadow-accent-500/30 transition-all duration-200 transform hover:-translate-y-0.5">
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 relative z-10">
                <Outlet />
            </main>
        </div>
    );
}
