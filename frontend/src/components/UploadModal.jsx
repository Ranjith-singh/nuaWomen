import { useState } from 'react';
import api from '../api/axios';
import { X, Upload } from 'lucide-react';

export default function UploadModal({ onClose, onSuccess }) {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setError('');
        const formData = new FormData();
        files.forEach(file => {
            formData.append('addFiles', file);
        });
        console.log("formData: ", formData.getAll('addFiles'))

        try {
            await api.post('/files/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onSuccess("Files Uploaded Successfully");
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 transform transition-all scale-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Upload Files</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}

                <div className="space-y-6">
                    <div className="group relative border-2 border-dashed border-slate-200 hover:border-brand-400 rounded-2xl p-8 text-center transition-all bg-slate-50 hover:bg-brand-50/30">
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            id="file-upload"
                        />
                        <div className="flex flex-col items-center justify-center pointer-events-none">
                            <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                                <Upload className="h-8 w-8 text-brand-500" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700 mb-1">Click to upload</span>
                            <span className="text-xs text-slate-400">SVG, PNG, JPG or GIF</span>
                        </div>
                    </div>

                    {files.length > 0 && (
                        <div className="bg-slate-50 rounded-xl p-4 max-h-40 overflow-y-auto custom-scrollbar">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Selected Files ({files.length})
                            </p>
                            <ul className="space-y-2">
                                {files.map((f, i) => (
                                    <li key={i} className="flex items-center text-sm text-slate-700 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                        <span className="w-2 h-2 rounded-full bg-brand-500 mr-2 flex-shrink-0"></span>
                                        <span className="truncate">{f.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={uploading || files.length === 0}
                            className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5"
                        >
                            {uploading ? 'Uploading...' : 'Upload Files'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
