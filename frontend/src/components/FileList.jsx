import { FileIcon, Download, Share2, Link as LinkIcon } from 'lucide-react';
import api from '../api/axios';
import { useState } from 'react';
import ShareModal from './ShareModal';
import ShareLinkModal from './ShareLinkModal';

export default function FileList({ files, isOwned, onRefresh }) {
    const [shareFile, setShareFile] = useState(null);
    const [linkFile, setLinkFile] = useState(null);

    const handleDownload = async (file) => {
        try {
            const response = await api.get(`/files/${file._id || file.id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Download failed", error);
            alert("Failed to download file");
        }
    };

    const openFile = async (file) => {
        try {
            const response = await api.get(`/files/${file.id || file._id}`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);

            window.open(url, '_blank');
            setTimeout(() => window.URL.revokeObjectURL(url), 100);

        } catch (error) {
            console.error("Error opening file:", error);
        }
    };

    if (!files || files.length === 0) {
        return <div className="text-gray-500 italic">No files found.</div>;
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {files.map((file) => {
                    // Simple file type color logic
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.filename);
                    const isPdf = /\.pdf$/i.test(file.filename);

                    let gradientClass = "from-brand-500 to-brand-400";
                    let iconBgClass = "bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white";

                    if (isImage) {
                        gradientClass = "from-purple-500 to-pink-500";
                        iconBgClass = "bg-purple-50 text-purple-600 group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:to-pink-500 group-hover:text-white";
                    } else if (isPdf) {
                        gradientClass = "from-red-500 to-orange-500";
                        iconBgClass = "bg-red-50 text-red-600 group-hover:bg-gradient-to-br group-hover:from-red-500 group-hover:to-orange-500 group-hover:text-white";
                    } else {
                        // Default
                        iconBgClass = "bg-brand-50 text-brand-600 group-hover:bg-gradient-to-br group-hover:from-brand-600 group-hover:to-brand-400 group-hover:text-white";
                    }

                    return (
                        <div key={file._id || file.id} className="relative group bg-white rounded-2xl shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
                            {/* Gradient Border Effect on Hover */}
                            <div className={`absolute -inset-0.5 bg-linear-to-r ${gradientClass} rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 blur-sm -z-10`}></div>

                            <div className="bg-white rounded-2xl p-5 h-full border border-slate-100 group-hover:border-transparent relative z-10">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0 mr-4">
                                        <div className="flex items-center mb-3">
                                            <div className={`p-3 rounded-xl mr-4 transition-all duration-300 shadow-sm ${iconBgClass}`}>
                                                <FileIcon className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-bold text-slate-800 truncate cursor-pointer hover:text-brand-600 transition-colors"
                                                    onClick={() => openFile(file)}
                                                    title={file.filename}>
                                                    {file.filename}
                                                </h3>
                                                <p className="text-xs font-medium text-slate-500 mt-0.5">
                                                    {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-md">
                                        {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'N/A'}
                                    </span>
                                    <div className="flex space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleDownload(file)}
                                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                            title="Download"
                                        >
                                            <Download className="h-4 w-4" />
                                        </button>
                                        {isOwned && (
                                            <>
                                                <button
                                                    onClick={() => setShareFile(file)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                    title="Share with users"
                                                >
                                                    <Share2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setLinkFile(file)}
                                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Create Share Link"
                                                >
                                                    <LinkIcon className="h-4 w-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {shareFile && (
                <ShareModal file={shareFile} onClose={() => setShareFile(null)} />
            )}
            {linkFile && (
                <ShareLinkModal file={linkFile} onClose={() => setLinkFile(null)} />
            )}
        </div>
    );
}
