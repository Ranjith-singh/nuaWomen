import { useState } from 'react';
import api from '../api/axios';
import { X } from 'lucide-react';

export default function ShareModal({ file, onClose }) {
    const [emails, setEmails] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleShare = async () => {
        if (!emails.trim()) return;

        setLoading(true);
        setError('');
        setSuccess('');

        // Split by comma and trim
        const emailList = emails.split(',').map(e => e.trim()).filter(e => e);

        try {
            await api.post(`/files/share/${file._id || file.id}`, { emails: emailList });
            setSuccess('File shared successfully!');
            setTimeout(onClose, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Share failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Share "{file.filename}"</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
                {success && <div className="p-3 mb-4 text-sm text-green-600 bg-green-50 rounded-lg">{success}</div>}

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Enter email addresses
                        </label>
                        <textarea
                            className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-3 min-h-[100px] resize-y"
                            rows={3}
                            value={emails}
                            onChange={(e) => setEmails(e.target.value)}
                            placeholder={"Note: needs to be one of our user \nuser1@example.com, user2@example.com"}
                        />
                        <p className="mt-1 text-xs text-slate-400">Comma separated</p>
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleShare}
                            disabled={loading || !emails.trim()}
                            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                            {loading ? 'Sharing...' : 'Share File'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
