import { useState } from 'react';
import api from '../api/axios';
import { X, Copy, Check } from 'lucide-react';

export default function ShareLinkModal({ file, onClose }) {
    const [expiryDate, setExpiryDate] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!expiryDate) return;

        setLoading(true);
        setError('');
        setGeneratedLink('');

        try {
            const res = await api.post(`/files/shareLink/${file._id || file.id}`, { expireDateTime: expiryDate });
            // console.log("shareLink: ", res)
            setGeneratedLink(res.data.data.url);
        } catch (err) {
            setError(err.response?.data?.message || 'Link generation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Create Share Link</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}

                <div className="space-y-6">
                    {!generatedLink ? (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Expiry Date
                                </label>
                                <input
                                    type="datetime-local"
                                    className="w-full rounded-xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-3"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                                <p className="mt-1 text-xs text-slate-400">Select when this link should expire</p>
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    onClick={onClose}
                                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading || !expiryDate}
                                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-brand-600 rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5"
                                >
                                    {loading ? 'Generating...' : 'Generate Link'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Shareable Link
                                </label>
                                <div className="flex rounded-xl shadow-sm">
                                    <input
                                        type="text"
                                        readOnly
                                        value={generatedLink}
                                        className="block w-full rounded-l-xl border-slate-200 bg-slate-50 focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-3 text-slate-600"
                                    />
                                    <button
                                        onClick={handleCopy}
                                        className="relative -ml-px inline-flex items-center space-x-2 rounded-r-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                    >
                                        {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-slate-400" />}
                                    </button>
                                </div>
                            </div>
                            <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                This link will expire on <span className="font-semibold text-slate-700">{new Date(expiryDate).toLocaleString()}</span>.
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
